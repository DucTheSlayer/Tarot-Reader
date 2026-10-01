package com.zl.eye.reading;

import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class AdMobThreadRegressionTest {
    private static final String TEST_BANNER = "ca-app-pub-3940256099942544/9214589741";

    private static class TestCall extends PluginCall {
        final CountDownLatch completed = new CountDownLatch(1);
        volatile String error;

        TestCall(String method, JSObject data) {
            super(null, "ALFAdMob", "android-thread-regression", method, data);
        }

        @Override public void resolve(JSObject data) { completed.countDown(); }
        @Override public void resolve() { completed.countDown(); }
        @Override public void reject(String message, String code, Exception exception, JSObject data) {
            error = message;
            completed.countDown();
        }
    }

    @Test
    public void productionPluginReplacesBannerSafelyFromWorkerThread() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            AtomicReference<TarotMainThreadAdMobPlugin> registered = new AtomicReference<>();
            scenario.onActivity(activity -> {
                Object plugin = activity.getBridge().getPlugin("ALFAdMob").getInstance();
                assertTrue("SDK calls must reach the safe plugin, not the auto-loaded original",
                    plugin instanceof TarotMainThreadAdMobPlugin);
                registered.set((TarotMainThreadAdMobPlugin) plugin);
            });
            TarotMainThreadAdMobPlugin plugin = registered.get();
            assertNotEquals(Looper.getMainLooper(), Looper.myLooper());

            TestCall initialize = new TestCall("initialize", new JSObject().put("appId", "test"));
            plugin.initialize(initialize);
            assertTrue("AdMob initialization timed out", initialize.completed.await(30, TimeUnit.SECONDS));
            assertNull(initialize.error);

            TestCall first = new TestCall("createBanner", new JSObject().put("adUnitId", TEST_BANNER));
            TestCall replacement = new TestCall("createBanner", new JSObject().put("adUnitId", TEST_BANNER));
            plugin.createBanner(first);
            plugin.createBanner(replacement);

            CountDownLatch dispatched = new CountDownLatch(1);
            AtomicBoolean onMainThread = new AtomicBoolean(false);
            plugin.onUiThread(replacement, () -> {
                onMainThread.set(Looper.myLooper() == Looper.getMainLooper());
                dispatched.countDown();
            });
            assertTrue(dispatched.await(10, TimeUnit.SECONDS));
            assertTrue(onMainThread.get());

            scenario.onActivity(activity -> {
                ViewGroup root = activity.findViewById(android.R.id.content);
                int matching = 0;
                for (int i = 0; i < root.getChildCount(); i++) {
                    View view = root.getChildAt(i);
                    // Ads are an implementation dependency of the company SDK,
                    // so inspect the attached runtime view without adding a
                    // second Mobile Ads dependency to the host app.
                    if ("com.google.android.gms.ads.AdView".equals(view.getClass().getName())) {
                        try {
                            Object adUnitId = view.getClass().getMethod("getAdUnitId").invoke(view);
                            if (TEST_BANNER.equals(adUnitId)) matching++;
                        } catch (ReflectiveOperationException error) {
                            throw new AssertionError(error);
                        }
                    }
                }
                assertEquals("Replacing a banner must leave exactly one attached view", 1, matching);
            });
            plugin.destroyBanner(new TestCall("destroyBanner", new JSObject().put("adUnitId", TEST_BANNER)));
        }
    }
}
