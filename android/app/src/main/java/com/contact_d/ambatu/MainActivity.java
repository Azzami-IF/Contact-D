package com.contact_d.ambatu;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install the splash screen
        SplashScreen.installSplashScreen(this);

        // Android 15 edge-to-edge support
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
    }
}
