package rtalkjs;

import org.stjs.javascript.Array;
import org.stjs.javascript.Map;
import org.stjs.javascript.RegExp;
import org.stjs.javascript.annotation.Adapter;
import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.annotation.ServerSide;
import org.stjs.javascript.annotation.Template;

@Adapter
@STJSBridge
public class VGObjectAdapter {
    @Template("adapter")
    public native static <T> T create(Class<Object> o, Object _prototype);

    @Template("adapter")
    public native static <T> T assign(Class<Object> o, T _instance, Object fromJson);

    @Template("adapter")
    public native static Array<String> keys(Class<Object> o, Object _instance);

    @Template("adapter")
    public native static Array<String> split(String string, RegExp re);

    @Template("or")
    @Native
    public static <T> T $or(T value, T... otherValues) {
        T result = value;
        if (!toBoolean(result)) {
            for (int i = 0; i < otherValues.length; i++) {
                result = otherValues[i];
                if (toBoolean(result)) {
                    break;
                }
            }
        }
        return result;
    }

    @ServerSide
    private static <T> boolean toBoolean(T result) {
        if (result == null)
            return false;
        if (result instanceof String)
            return !"".equals(result);
        if (result instanceof Number) {
            double d = ((Number) result).doubleValue();
            return !Double.isNaN(d) && d != 0.;
        }
        if (result instanceof Map) {
            Map m = (Map) result;
            return !m.java().isEmpty();
        }
        if (result instanceof Array) {
            Array a = (Array) result;
            return a.$length() != 0;
        }
        return true;
    }

    @Template("adapter")
    @Native
    public static String toString(Integer i, int radix) {
        return Integer.toString(i, radix);
    }

    @Template("adapter")
    @Native
    public static boolean hasOwnProperty(Object obj, String property) {
        if (obj == null)
            return false;
        if (obj instanceof java.util.Map) {
            return ((java.util.Map) obj).containsKey(property);
        }
        if (obj instanceof Map) {
            return ((Map) obj).java().containsKey(property);
        }
        return false;
    }

}
