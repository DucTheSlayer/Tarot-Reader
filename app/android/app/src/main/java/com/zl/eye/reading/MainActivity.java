package com.zl.eye.reading;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.content.pm.ApplicationInfo;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        super.onCreate(savedInstanceState);

        // Android 15+ enforces edge-to-edge for apps targeting recent SDKs.
        // Some WebView versions report CSS safe-area insets as zero. Keep its
        // viewport inside both system bars so content stays clear of navigation.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            applySystemBarInsets();
        }
    }

    private void applySystemBarInsets() {
        View webView = bridge.getWebView();
        int initialLeft = webView.getPaddingLeft();
        int initialTop = webView.getPaddingTop();
        int initialRight = webView.getPaddingRight();
        int initialBottom = webView.getPaddingBottom();
        int initialBottomMargin = ((ViewGroup.MarginLayoutParams) webView.getLayoutParams()).bottomMargin;

        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets topInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.statusBars()
                    | WindowInsetsCompat.Type.displayCutout()
            );
            Insets bottomInsets = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars());
            view.setPadding(
                initialLeft,
                initialTop + topInsets.top,
                initialRight,
                initialBottom
            );
            ViewGroup.MarginLayoutParams layoutParams = (ViewGroup.MarginLayoutParams) view.getLayoutParams();
            int bottomMargin = initialBottomMargin + bottomInsets.bottom;
            if (layoutParams.bottomMargin != bottomMargin) {
                layoutParams.bottomMargin = bottomMargin;
                view.setLayoutParams(layoutParams);
            }
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }
}
