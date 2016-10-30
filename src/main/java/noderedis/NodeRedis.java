package noderedis;

import org.stjs.javascript.Array;
import org.stjs.javascript.Map;
import org.stjs.javascript.Promise;
import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.functions.Callback2;

@STJSBridge
public class NodeRedis {
    @Native
    public static NodeRedis createClient() {
        return null;
    }

    @Native
    public void exists(String key, Callback2<Object, Integer> responseCallback) {
    }

    @Native
    public Promise<Integer> existsAsync(String key) {
        return null;
    }

    @Native
    public Multi multi() {
        return null;
    }

    @Native
    public void hget(String key, String field, Callback2<Object, String> cb) {
        throw new RuntimeException("TODO NodeRedis.hget");
    }

    @Native
    public Promise<String> hgetAsync(String key, String field) {
        return null;
    }

    @Native
    public Promise<Double> zcardAsync(String kReadyQueue) {
        throw new RuntimeException("TODO NodeRedis.zcardAsync");
    }

    @Native
    public Promise<Array<String>> zrangeAsync(String key, double min, double max) {
        throw new RuntimeException("TODO NodeRedis.zrangeAsync");
    }

    @Native
    public Promise<Map<String, String>> hgetAllAsync(String kJob) {
        throw new RuntimeException("TODO NodeRedis.hgetAllAsync");
    }

    @Native
    public Promise<Double> zscoreAsync(String kDelayQueue, String id) {
        return null;
    }

    @Native
    public Promise<Array<String>> zrangebyscoreAsync(String kDelayQueue, double min, double max) {
        throw new RuntimeException("TODO NodeRedis.zrangeByScoreAsync");
    }

    @Native
    public Promise<Integer> zaddAsync(String kReadyQueue, Array scoreMember) {
        throw new RuntimeException("TODO NodeRedis.zaddAsync");
    }

    @Native
    public Promise<Array<String>> zrangebyscoreAsync(String kDelayQueue, double d, double positiveInfinity,
            String limit, int offset, int count) {
        throw new RuntimeException("TODO NodeRedis.zrangebyscoreAsync");
    }

    @Native
    public Promise<Integer> zcountAsync(String kDelayQueue, int i, long now) {
        throw new RuntimeException("TODO NodeRedis.zcountAsync");
    }

    @Native
    public Promise<String> getAsync(String k) {
        throw new RuntimeException("TODO NodeRedis.getAsync");
    }

}
