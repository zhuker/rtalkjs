package rtalkjs;

import org.stjs.javascript.Date;
import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.annotation.Template;

// http://momentjs.com/timezone/
@STJSBridge
public class Moment {
    @STJSBridge
    public static class Duration {
        @Native
        public String humanize() {
            return null;
        }
    }

    @STJSBridge
    public static class Timezone {

        @Native
        public String guess() {
            return null;
        }
    }
    
    public static Timezone tz;

    /**
     * <pre>
     * var a = moment.tz("2013-11-18 11:55", "America/Toronto");
     * </pre>
     * 
     * @param str
     * @param zone
     * @return
     */
    @Native
    public static Timezone tz(String str, String zone) {
        return null;
    }

    @Template("invoke")
    @Native
    public static Moment $invoke(String string) {
        return null;
    }

    @Template("invoke")
    @Native
    public static Moment $invoke(Date date) {
        return null;
    }
    
    @Template("invoke")
    @Native
    public static Moment $invoke(long date) {
        return null;
    }
    @Template("invoke")
    @Native
    public static Moment $invoke() {
        return null;
    }

    @Native
    public static Duration duration(long millis) {
        return null;
    }

    @Native
    public String calendar() {
        return null;
    }
    
    @Native
    public String fromNow() {
        return null;
    }

}
