package noderedis;

import org.stjs.javascript.Array;
import org.stjs.javascript.Promise;
import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.functions.Callback2;

@STJSBridge
public class Multi {

    @Native
    public void zadd(String key, double score, String value) {
        throw new RuntimeException("TODO Multi.zadd");
    }

    @Native
    public void hset(String key, String field, String value) {
        throw new RuntimeException("TODO Multi.hset");
    }

    @Native
    public void exec(Callback2<Object, Array> callback) {
        throw new RuntimeException("TODO Multi.exec");
    }
    
    @Native
    public Promise<Array> execAsync() {
        throw new RuntimeException("TODO Multi.exec");
    }

    @Native
    public void zrem(String kReadyQueue, String id) {
        throw new RuntimeException("TODO Multi.zrem");
    }

    @Native
    public void decr(String kReserveCount) {
        throw new RuntimeException("TODO Multi.decr");
    }

    @Native
    public void hincrBy(String kJob, String fburies, int i) {
        throw new RuntimeException("TODO Multi.hincrBy");
    }

    @Native
    public void incr(String kReserveCount) {
        throw new RuntimeException("TODO Multi.incr");
    }

    @Native
    public void del(String kJob) {
        throw new RuntimeException("TODO Multi.del");
    }

    @Native
    public void zcard(String kReadyQueue) {
        throw new RuntimeException("TODO Multi.zcard");
    }

    @Native
    public void zcount(String kDelayQueue, int i, long now) {
        throw new RuntimeException("TODO Multi.zcount");
    }

    @Native
    public void get(String kReserveCount) {
        throw new RuntimeException("TODO Multi.get");
    }

}
