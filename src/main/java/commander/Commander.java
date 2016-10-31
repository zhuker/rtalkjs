package commander;

import org.stjs.javascript.Array;
import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.functions.Callback1;
import org.stjs.javascript.functions.Callback2;

@STJSBridge
public class Commander {
    @Native
    public Commander usage(String str) {
        return this;
    }
    
    @Native
    public Commander version(String str) {
        return this;
    }
    
    @Native
    public Commander option(String str, String desc) {
        return this;
    }
    
    @Native
    public Commander option(String str, String desc, String defaultValue) {
        return this;
    }

    @Native
    public Commander parse(Array<String> argv) {
        return this;
    }

    @Native
    public Commander command(String string, String string2) {
        throw new RuntimeException("TODO Commander.command");
    }

    @Native
    public Commander command(String string) {
        throw new RuntimeException("TODO Commander.command");
    }

    @Native
    public Commander action(Callback1<String> object) {
        throw new RuntimeException("TODO Commander.action");
    }

    @Native
    public Commander action(Callback2<String, Command> object) {
        throw new RuntimeException("TODO Commander.action");
    }
    
    @Native
    public void help() {
        
    }
}
