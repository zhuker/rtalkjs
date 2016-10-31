package rtalkjs;

import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.annotation.STJSBridge;

@STJSBridge
public class PrintJ {
    @Native
    public static void printf(Object... arguments) {
    }

    @Native
    public static String sprintf(Object... arguments) {
        return null;
    }

}
