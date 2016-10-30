package rtalkjs;

public class Pair<K, V> {
    public K key;
    public V value;

    public static <K, V> Pair<K, V> of(K k, V v) {
        Pair<K, V> p = new Pair<>();
        p.key = k;
        p.value = v;
        return p;
    }
}
