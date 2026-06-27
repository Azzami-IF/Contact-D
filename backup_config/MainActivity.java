package com.contact_d.ambatu;

import android.os.Bundle;
import android.os.SystemClock;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final long SPLASH_DURATION_MS = 800;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        long splashStartedAt = SystemClock.uptimeMillis();
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);

        splashScreen.setKeepOnScreenCondition(() ->
            SystemClock.uptimeMillis() - splashStartedAt < SPLASH_DURATION_MS
        );

        super.onCreate(savedInstanceState);
    }
}
