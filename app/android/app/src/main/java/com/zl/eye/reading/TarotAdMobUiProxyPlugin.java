package com.zl.eye.reading;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import alf.admob.ALFAdMobPlugin;

/**
 * App-owned compatibility proxy. Capacitor invokes plugin methods on a worker
 * thread, while recent Google Mobile Ads releases require ad operations on the
 * main UI thread. The company SDK remains untouched.
 */
@CapacitorPlugin(name = "TarotAdMobUiProxy")
public class TarotAdMobUiProxyPlugin extends Plugin {

    @FunctionalInterface
    private interface AdMobAction {
        void run(ALFAdMobPlugin plugin);
    }

    private void onUiThread(PluginCall call, AdMobAction action) {
        getActivity().runOnUiThread(() -> {
            try {
                PluginHandle handle = getBridge().getPlugin("ALFAdMob");
                if (handle == null || !(handle.getInstance() instanceof ALFAdMobPlugin)) {
                    call.reject("ALFAdMob plugin is unavailable");
                    return;
                }
                action.run((ALFAdMobPlugin) handle.getInstance());
            } catch (Exception error) {
                call.reject("AdMob operation failed", error);
            }
        });
    }

    @PluginMethod
    public void createBanner(PluginCall call) {
        onUiThread(call, plugin -> plugin.createBanner(call));
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        onUiThread(call, plugin -> plugin.showBanner(call));
    }

    @PluginMethod
    public void hideBanner(PluginCall call) {
        onUiThread(call, plugin -> plugin.hideBanner(call));
    }

    @PluginMethod
    public void destroyBanner(PluginCall call) {
        onUiThread(call, plugin -> plugin.destroyBanner(call));
    }

    @PluginMethod
    public void loadInterstitial(PluginCall call) {
        onUiThread(call, plugin -> plugin.loadInterstitial(call));
    }

    @PluginMethod
    public void isInterstitialReady(PluginCall call) {
        onUiThread(call, plugin -> plugin.isInterstitialReady(call));
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        onUiThread(call, plugin -> plugin.showInterstitial(call));
    }

    @PluginMethod
    public void loadRewardedAd(PluginCall call) {
        onUiThread(call, plugin -> plugin.loadRewardedAd(call));
    }

    @PluginMethod
    public void isRewardedAdReady(PluginCall call) {
        onUiThread(call, plugin -> plugin.isRewardedAdReady(call));
    }

    @PluginMethod
    public void showRewardedAd(PluginCall call) {
        onUiThread(call, plugin -> plugin.showRewardedAd(call));
    }

    @PluginMethod
    public void loadOpenAppAd(PluginCall call) {
        onUiThread(call, plugin -> plugin.loadOpenAppAd(call));
    }

    @PluginMethod
    public void isOpenAppAdReady(PluginCall call) {
        onUiThread(call, plugin -> plugin.isOpenAppAdReady(call));
    }

    @PluginMethod
    public void showOpenAppAd(PluginCall call) {
        onUiThread(call, plugin -> plugin.showOpenAppAd(call));
    }

    @PluginMethod
    public void loadNativeAd(PluginCall call) {
        onUiThread(call, plugin -> plugin.loadNativeAd(call));
    }

    @PluginMethod
    public void destroyNativeAd(PluginCall call) {
        onUiThread(call, plugin -> plugin.destroyNativeAd(call));
    }

    @PluginMethod
    public void reportNativeAdClick(PluginCall call) {
        onUiThread(call, plugin -> plugin.reportNativeAdClick(call));
    }
}
