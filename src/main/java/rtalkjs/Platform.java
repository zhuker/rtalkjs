package rtalkjs;

import org.stjs.javascript.Date;
import org.stjs.javascript.Map;

public class Platform {

    final static String possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    static String makeid() {
        String text = "";
    
        for (int i = 0; i < 11; i++)
            text += possible.charAt((int) (Math.floor(Math.random() * possible.length())));
    
        return text;
    }

    static long currentTimeMillis() {
        return (long) Date.now();
    }
    
    public static boolean isEmptyMap(Map map) {
        return map == null || VGObjectAdapter.keys(Object.class, map).$length() == 0;
    }
    
}
