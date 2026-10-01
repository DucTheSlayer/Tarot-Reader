package com.zl.eye.reading;

import android.app.Activity;

import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import alf.admob.ALFAdMobPlugin;

/**
 * Protects the original ALFAdMob entry point as well as the QA proxy. The SDK's
 * banner replacement removes an existing Android view before its own UI-thread
 * block, so dispatching only the later addView/loadAd operations is insufficient.
 * Keep the SDK plugin ID and inherited events intact for ALF.Instance.Ads callers.
 */
@CapacitorPlugin(name = "ALFAdMob")
public class TarotMainThreadAdMobPlugin extends ALFAdMobPlugin {
    void onUiThread(PluginCall call, Runnable operation) {
        Activity activity = getActivity();
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            call.reject("AdMob activity is unavailable");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                operation.run();
            } catch (Exception error) {
                call.reject("AdMob operation failed", error);
            }
        });
    }

    @Override @PluginMethod
    public void initialize(PluginCall call) {
        onUiThread(call, () -> super.initialize(call));
    }

    @Override @PluginMethod
    public void createBanner(PluginCall call) {
        onUiThread(call, () -> super.createBanner(call));
    }

    @Override @PluginMethod
    public void showBanner(PluginCall call) {
        onUiThread(call, () -> super.showBanner(call));
    }

    @Override @PluginMethod
    public void hideBanner(PluginCall call) {
        onUiThread(call, () -> super.hideBanner(call));
    }

    @Override @PluginMethod
    public void destroyBanner(PluginCall call) {
        onUiThread(call, () -> super.destroyBanner(call));
    }

    @Override @PluginMethod
    public void loadInterstitial(PluginCall call) {
        onUiThread(call, () -> super.loadInterstitial(call));
    }

    @Override @PluginMethod
    public void isInterstitialReady(PluginCall call) {
        onUiThread(call, () -> super.isInterstitialReady(call));
    }

    @Override @PluginMethod
    public void showInterstitial(PluginCall call) {
        onUiThread(call, () -> super.showInterstitial(call));
    }

    @Override @PluginMethod
    public void loadRewardedAd(PluginCall call) {
        onUiThread(call, () -> super.loadRewardedAd(call));
    }

    @Override @PluginMethod
    public void isRewardedAdReady(PluginCall call) {
        onUiThread(call, () -> super.isRewardedAdReady(call));
    }

    @Override @PluginMethod
    public void showRewardedAd(PluginCall call) {
        onUiThread(call, () -> super.showRewardedAd(call));
    }

    @Override @PluginMethod
    public void loadOpenAppAd(PluginCall call) {
        onUiThread(call, () -> super.loadOpenAppAd(call));
    }

    @Override @PluginMethod
    public void isOpenAppAdReady(PluginCall call) {
        onUiThread(call, () -> super.isOpenAppAdReady(call));
    }

    @Override @PluginMethod
    public void showOpenAppAd(PluginCall call) {
        onUiThread(call, () -> super.showOpenAppAd(call));
    }

    @Override @PluginMethod
    public void loadNativeAd(PluginCall call) {
        onUiThread(call, () -> super.loadNativeAd(call));
    }

    @Override @PluginMethod
    public void isNativeAdReady(PluginCall call) {
        onUiThread(call, () -> super.isNativeAdReady(call));
    }

    @Override @PluginMethod
    public void destroyNativeAd(PluginCall call) {
        onUiThread(call, () -> super.destroyNativeAd(call));
    }

    @Override @PluginMethod
    public void reportNativeAdClick(PluginCall call) {
        onUiThread(call, () -> super.reportNativeAdClick(call));
    }
}
