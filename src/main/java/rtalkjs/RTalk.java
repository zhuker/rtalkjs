package rtalkjs;

import static com.vg.js.node.NodeJS.process;
import static com.vg.js.node.NodeJS.require;
import static org.stjs.javascript.Global.console;
import static org.stjs.javascript.JSCollections.$array;
import static org.stjs.javascript.JSGlobal.Boolean;
import static org.stjs.javascript.JSGlobal.JSON;
import static org.stjs.javascript.JSGlobal.isNaN;
import static org.stjs.javascript.JSGlobal.parseInt;
import static org.stjs.javascript.JSObjectAdapter.$get;
import static org.stjs.javascript.Promise.resolve;
import static rtalkjs.Platform.currentTimeMillis;
import static rtalkjs.PrintJ.sprintf;

import com.vg.js.bridge.Rx.Observable;

import org.stjs.javascript.Array;
import org.stjs.javascript.Map;
import org.stjs.javascript.Promise;
import org.stjs.javascript.annotation.Native;
import org.stjs.javascript.functions.Callback1;

import commander.Commander;
import noderedis.Multi;
import noderedis.NodeRedis;
import rtalkjs.RTalk.Response;

public class RTalk {

    public static final String KICKED = "KICKED";
    public static final String DELETED = "DELETED";
    public static final String TOUCHED = "TOUCHED";
    public static final String BURIED = "BURIED";
    public static final String RELEASED = "RELEASED";
    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String RESERVED = "RESERVED";
    public static final String TIMED_OUT = "TIMED_OUT";
    public static final String DEADLINE_SOON = "DEADLINE_SOON";
    public static final String INSERTED = "INSERTED";
    public static final String EXPECTED_CRLF = "EXPECTED_CRLF";
    public static final String JOB_TOO_BIG = "JOB_TOO_BIG";
    public static final String DRAINING = "DRAINING";
    private String kReadyQueue;
    private String kDelayQueue;
    private String kBuried;
    private String kDeleteCount;
    private String kReserveCount;

    protected final String tube;

    public RTalk(NodeRedis client, String tube) {
        if (!Boolean(tube)) {
            tube = "default";
        }
        this.tube = tube;
        this.kReadyQueue = tube + "_readyQueue";
        this.kDelayQueue = tube + "_delayQueue";
        this.kBuried = tube + "_buried";
        this.kDeleteCount = tube + "_deleted";
        this.kReserveCount = tube + "_reserved";
        this.client = client;
    }

    NodeRedis client;

    protected NodeRedis getRedis() {
        return client;
    }

    public static void main(String[] args) throws Exception {
        Commander program = require("commander");
        program
                .version("1.0.3")
                .option("-u, --url [url]", "Redis URL [redis://localhost:6379/0]", "redis://localhost:6379/0")
                .option("-t, --tube [tube]", "RTalk tube to use [default]", "default")
                .command("stats-tube")
                .action((e) -> {
                    String tube = toStr($get(program, "tube"));
                    console.log("stats-tube", tube);
                    String url = toStr($get(program, "url"));
                    NodeRedis r = NodeRedis.createClient(url);
                    RTalk rtalk = new RTalk(r, tube);
                    rtalk.statsTube().$then(response -> {
                        console.log(response);
                        r.quit();
                    });
                });
        program.command("kick-job <jobid>").action((jobid) -> {
            String tube = toStr($get(program, "tube"));
            console.log("kick-job", tube, jobid);
            String url = (String) $get(program, "url");
            NodeRedis r = NodeRedis.createClient(url);
            RTalk rtalk = new RTalk(r, tube);
            rtalk.kickJob(jobid).$then(response -> {
                console.log(response);
                r.quit();
            });
        });
        program
                .command("bury <jobid>")
                .option("-p, --priority [pri]", "Job priority")
                .option("-r, --reason [reason]", "Bury reason text description")
                .$action((jobid, cmd) -> {
                    String tube = toStr($get(program, "tube"));
                    console.log("bury", tube, jobid);
                    long pri = toLong($get(cmd, "priority"));
                    String reason = toStr($get(cmd, "reason"));
                    String url = toStr($get(program, "url"));
                    NodeRedis r = NodeRedis.createClient(url);
                    RTalk rtalk = new RTalk(r, tube);
                    rtalk.bury(jobid, pri, reason).$then(response -> {
                        console.log(response);
                        r.quit();
                    });
                });
        program.command("reserve").$action((cmd) -> {
            String tube = toStr($get(program, "tube"));
            console.log("reserve", tube);
            String url = toStr($get(program, "url"));
            NodeRedis r = NodeRedis.createClient(url);
            RTalk rtalk = new RTalk(r, tube);
            rtalk.reserve(0).$then(response -> {
                console.log(response);
                r.quit();
            });
        });
        program.command("touch <jobid>").$action((jobid, cmd) -> {
            String tube = toStr($get(program, "tube"));
            console.log("touch", tube, jobid);
            String url = toStr($get(program, "url"));
            NodeRedis r = NodeRedis.createClient(url);
            RTalk rtalk = new RTalk(r, tube);
            rtalk.touch(jobid).$then(response -> {
                console.log(response);
                r.quit();
            });
        });

        program.command("stats-jobs").option("-H, --human", "Print in human-readable format").$action((cmd) -> {
            String tube = toStr($get(program, "tube"));
            console.log("stats-jobs", tube);
            boolean human = Boolean($get(cmd, "human"));
            String url = (String) $get(program, "url");
            NodeRedis r = NodeRedis.createClient(url);
            RTalk rtalk = new RTalk(r, tube);

            console.log(sprintf("%5.5s %19.19s %13.13s %4s %4s %4s %4s %4s %4s %s %s", "State", "Ready Time",
                    "TTR Duration", "Pri", "Rsrv", "Rels", "Bury", "Kick", "Tout", "id", "data"));
            rtalk.statsJobs().$finally(() -> r.quit()).subscribe(job -> {
                if (human) {
                    String readyTime = Moment.$invoke(job.readyTime).calendar();
                    String duration = Moment.duration(job.ttrMsec).humanize();
                    console.log(sprintf("%5.5s %19.19s %13.13s %3d %4d %4d %4d %4d %4d %s %s", job.state, readyTime,
                            duration, job.pri, job.reserves, job.releases, job.buries, job.kicks, job.timeouts, job.id,
                            escape(job.data.substring(0, 100)) + (job.error == null ? "" : " " + escape(job.error))));
                } else {
                    console.log(JSON.stringify(job));
                }
            }, err -> {
                console.error("unhandled", err);
            });
        });
        program.command("flush").$action((cmd) -> {
            String tube = toStr($get(program, "tube"));
            console.log("flush", tube);
            String url = toStr($get(program, "url"));
            NodeRedis r = NodeRedis.createClient(url);
            RTalk rtalk = new RTalk(r, tube);
            rtalk.flushTube().subscribe(id -> {
                console.log(DELETED, id);
            }, err -> {
                console.log(err);
            }, () -> {
                r.quit();
            });
        });
        program.parse(process.argv);

        if (process.argv.slice(2).$length() == 0) {
            program.help();
            return;
        }
    }

    private static String toStr(Object obj) {
        if (obj == null) {
            return "";
        }
        return "" + obj;
    }

    private static String escape(String data) {
        if (data == null)
            return "(null)";
        return data.replaceAll("\n", "\\n");
    }

    protected Promise<Array> updateRedisTransaction(Callback1<Multi> m) {
        Multi multi = getRedis().multi();
        m.$invoke(multi);
        return multi.execAsync();
    }

    public String getTube() {
        return tube;
    }

    /**
     * use <tube>\r\n
     * 
     * - <tube> is a name at most 200 bytes. It specifies the tube to use. If
     * the tube does not exist, it will be created.
     * 
     * The only reply is:
     * 
     * USING <tube>\r\n
     * 
     * - <tube> is the name of the tube now being used.
     */
    public static RTalk use(NodeRedis jedis, String tube) {
        return new RTalk(jedis, tube);
    }

    /**
     * put <pri> <delay> <ttr> <bytes>\r\n
     * 
     * <data>\r\n
     * 
     * It inserts a job into the client's currently used tube (see the "use"
     * command below).
     * 
     * - <pri> is an integer < 2**32. Jobs with smaller priority values will be
     * scheduled before jobs with larger priorities. The most urgent priority is
     * 0; the least urgent priority is 4,294,967,295.
     * 
     * - <delay> is an integer number of seconds to wait before putting the job
     * in the ready queue. The job will be in the "delayed" state during this
     * time.
     * 
     * - <ttr> -- time to run -- is an integer number of seconds to allow a
     * worker to run this job. This time is counted from the moment a worker
     * reserves this job. If the worker does not delete, release, or bury the
     * job within <ttr> seconds, the job will time out and the server will
     * release the job. The minimum ttr is 1. If the client sends 0, the server
     * will silently increase the ttr to 1.
     * 
     * - <bytes> is an integer indicating the size of the job body, not
     * including the trailing "\r\n". This value must be less than max-job-size
     * (default: 2**16).
     * 
     * - <data> is the job body -- a sequence of bytes of length <bytes> from
     * the previous line.
     * 
     * After sending the command line and body, the client waits for a reply,
     * which may be:
     * 
     * - "INSERTED <id>\r\n" to indicate success.
     * 
     * - <id> is the integer id of the new job
     * 
     * - "BURIED <id>\r\n" if the server ran out of memory trying to grow the
     * priority queue data structure.
     * 
     * - <id> is the integer id of the new job
     * 
     * - "EXPECTED_CRLF\r\n" The job body must be followed by a CR-LF pair, that
     * is, "\r\n". These two bytes are not counted in the job size given by the
     * client in the put command line.
     * 
     * - "JOB_TOO_BIG\r\n" The client has requested to put a job with a body
     * larger than max-job-size bytes.
     * 
     * - "DRAINING\r\n" This means that the server has been put into "drain
     * mode" and is no longer accepting new jobs. The client should try another
     * server or disconnect and try again later.
     * 
     * The "use" command is for producers. Subsequent put commands will put jobs
     * into the tube specified by this command. If no use command has been
     * issued, jobs will be put into the tube named "default".
     */
    public static class Job {
        public static final String DELAYED = "DELAYED";
        public static final String READY = "READY";
        public static final String RESERVED = "RESERVED";
        public static final String BURIED = "BURIED";

        public String id;
        public long ttrMsec;
        public String data;
        public String state;
        public long pri;
        public String tube;
        public long reserves;
        public long releases;
        public long buries;
        public long kicks;
        public long timeouts;
        public long readyTime;
        public long ctime;
        public long now;
        public String error;

        /**
         * - "age" is the time in seconds since the put command that created
         * this job.
         */
        public long age() {
            return now - ctime;
        }

        /**
         * - "time-left" is the number of seconds left until the server puts
         * this job into the ready queue. This number is only meaningful if the
         * job is reserved or delayed. If the job is reserved and this amount of
         * time
         */
        public long timeLeft() {
            return readyTime - now;
        }
    }

    public static class Response {
        public final String tube;
        public String status;
        public String id;
        public String data;
        public String error;

        @Native
        public Response(String tube, String status, String id) {
            this.status = status;
            this.id = id;
            this.tube = tube;
        }

        public Response(String tube, String status, String id, String data) {
            this.status = status;
            this.id = id;
            this.data = data;
            this.tube = tube;
        }

        public boolean isReserved() {
            return RESERVED.equals(status);
        }

        public boolean isInserted() {
            return INSERTED.equals(status);
        }

        public boolean isDeleted() {
            return DELETED.equals(status);
        }

        public boolean isBuried() {
            return BURIED.equals(status);
        }

        public boolean isKicked() {
            return KICKED.equals(status);
        }

        @Override
        public String toString() {
            String builder = "";
            builder += "{\"";
            if (tube != null) {
                builder += ("tube\":\"");
                builder += (tube);
                builder += ("\",\"");
            }
            if (id != null) {
                builder += ("id\":\"");
                builder += (id);
                builder += ("\",\"");
            }
            if (status != null) {
                builder += ("status\":\"");
                builder += (status);
                builder += ("\",\"");
            }
            if (error != null) {
                builder += ("error\":\"");
                builder += (error);
                builder += ("\",\"");
            }
            if (data != null) {
                builder += ("data\":\"");
                builder += (data);
            }
            builder += ("\"}");
            return builder.toString();
        }
    }

    public Promise<Response> put(long pri, long delayMsec, long ttrMsec, String data) {
        String id = newId();
        return putWithId(id, pri, delayMsec, ttrMsec, data);
    }

    protected String newId() {
        return Platform.makeid();
    }

    public Promise<Response> putWithId(String id, long pri, long delayMsec, long ttrMsec, String data) {
        Promise<Boolean> contains = contains(id);
        Promise<Response> put = contains.then(idExists -> {
            if (idExists) {
                Promise<Response> bury = bury(id, pri);
                return bury;
            }
            long _ttrMsec = Math.max(1000, ttrMsec);
            String status = delayMsec > 0 ? Job.DELAYED : Job.READY;
            Promise<Array> exec = updateRedisTransaction(tx -> {
                long now = Platform.currentTimeMillis();
                if (delayMsec > 0) {
                    long readyTimeMsec = now + delayMsec;
                    tx.zadd(kDelayQueue, readyTimeMsec, id);
                } else {
                    tx.zadd(kReadyQueue, pri, id);
                }
                tx.hset(kJob(id), fPriority, Long.toString(pri));
                tx.hset(kJob(id), fTtr, Long.toString(_ttrMsec));
                tx.hset(kJob(id), fData, data);
                tx.hset(kJob(id), fState, status);
                tx.hset(kJob(id), fCtime, Long.toString(now));
                tx.hset(kJob(id), fTube, tube);
            });
            return exec.then(a -> resolve(on(Response(INSERTED, id, data))));
        });
        return put;
    }

    protected Response on(Response response) {
        return response;
    }

    private static final String fTube = "tube";
    private static final String fState = "state";
    private static final String fPriority = "pri";
    private static final String fReserves = "reserves";
    private static final String fCtime = "ctime";
    private static final String fTtr = "ttr";
    private static final String fData = "data";
    private static final String fTimeouts = "timeouts";
    private static final String fReleases = "releases";
    private static final String fBuries = "buries";
    private static final String fKicks = "kicks";

    private static final String fBuryReason = "error";

    private String kJob(String id) {
        return tube + "_" + id;
    }

    public Promise<Boolean> contains(String id) {
        return getRedis().existsAsync(kJob(id)).then(i -> resolve(Boolean(i)));
    }

    private Promise<Boolean> _isBuried(String id) {
        return getRedis().zscoreAsync(kBuried, id).then(i -> resolve(i != null));
    }

    /**
     * The bury command puts a job into the "buried" state. Buried jobs are put
     * into a FIFO linked list and will not be touched by the server again until
     * a client kicks them with the "kick" command.
     * 
     * The bury command looks like this:
     * 
     * bury <id> <pri>\r\n
     * 
     * - <id> is the job id to release.
     * 
     * - <pri> is a new priority to assign to the job.
     * 
     * There are two possible responses:
     * 
     * - "BURIED\r\n" to indicate success.
     * 
     * - "NOT_FOUND\r\n" if the job does not exist or is not reserved by the
     * client.
     */
    public Promise<Response> bury(String id, long pri, String reason) {
        Promise<Boolean> contains = contains(id);
        return contains.then(_contains -> {
            if (!_contains) {
                return resolve(Response(NOT_FOUND, id));
            }
            return getRedis().hgetAsync(kJob(id), fData).then(data -> {
                Multi tx = getRedis().multi();
                tx.zrem(kReadyQueue, id);
                tx.zrem(kDelayQueue, id);
                tx.hset(kJob(id), fPriority, Long.toString(pri));
                tx.hset(kJob(id), fState, Job.BURIED);
                tx.decr(kReserveCount);
                if (reason != null) {
                    tx.hset(kJob(id), fBuryReason, reason);
                }
                tx.hincrby(kJob(id), fBuries, 1);
                tx.zadd(kBuried, currentTimeMillis(), id);

                return tx.execAsync().then(a -> {
                    Response response = Response(BURIED, id, data);
                    response.error = reason;
                    return resolve(on(response));
                });
            });
        });
    }

    /**
     * The delete command removes a job from the server entirely. It is normally
     * used by the client when the job has successfully run to completion. A
     * client can delete jobs that it has reserved, ready jobs, delayed jobs,
     * and jobs that are buried. The delete command looks like this:
     * 
     * delete <id>\r\n
     * 
     * - <id> is the job id to delete.
     * 
     * The client then waits for one line of response, which may be:
     * 
     * - "DELETED\r\n" to indicate success.
     * 
     * - "NOT_FOUND\r\n" if the job does not exist or is not either reserved by
     * the client, ready, or buried. This could happen if the job timed out
     * before the client sent the delete command.
     */
    public Promise<Response> Delete(String id) {
        return contains(id).then(_contains -> {
            if (!_contains) {
                return resolve(Response(NOT_FOUND, id));
            }
            Promise<rtalkjs.RTalk.Response> then2 = updateRedisTransaction(tx -> {
                tx.zrem(kDelayQueue, id);
                tx.zrem(kReadyQueue, id);
                tx.del(kJob(id));
                tx.incr(kDeleteCount);
                tx.decr(kReserveCount);
            }).then(a -> resolve(on(Response(DELETED, id))));
            return then2;
        });
    }

    @Native
    private Response Response(String status, String id) {
        return new Response(getTube(), status, id, null);
    }

    private Response Response(String status, String id, String data) {
        return new Response(getTube(), status, id, data);
    }

    @Native
    public Promise<Response> bury(String id, long pri) {
        return bury(id, pri, null);
    }

    public Observable<Long> _pri(NodeRedis r, String id) {
        return toLongRx(r.hgetAsync(kJob(id), fPriority));
    }

    private static Observable<Long> toLongRx(Promise<String> hgetAsync) {
        return Observable.fromPromise(hgetAsync).map(str -> toLong(str));
    }

    /**
     * The release command puts a reserved job back into the ready queue (and
     * marks its state as "ready") to be run by any client. It is normally used
     * when the job fails because of a transitory error. It looks like this:
     * 
     * release <id> <pri> <delay>\r\n
     * 
     * - <id> is the job id to release.
     * 
     * - <pri> is a new priority to assign to the job.
     * 
     * - <delay> is an integer number of seconds to wait before putting the job
     * in the ready queue. The job will be in the "delayed" state during this
     * time.
     * 
     * The client expects one line of response, which may be:
     * 
     * - "RELEASED\r\n" to indicate success.
     * 
     * - "BURIED\r\n" if the server ran out of memory trying to grow the
     * priority queue data structure.
     * 
     * - "NOT_FOUND\r\n" if the job does not exist or is not reserved by the
     * client.
     */
    public Promise<Response> release(String id, long pri, long delayMsec) {
        return contains(id).then(_contains -> {
            if (!_contains) {
                return resolve(Response(NOT_FOUND, id));
            }
            return updateRedisTransaction(tx -> {
                if (delayMsec == 0) {
                    tx.zadd(kReadyQueue, pri, id);
                }
                tx.zadd(kDelayQueue, currentTimeMillis() + delayMsec, id);
                tx.hset(kJob(id), fPriority, Long.toString(pri));
                tx.hset(kJob(id), fState, delayMsec > 0 ? Job.DELAYED : Job.READY);
                tx.decr(kReserveCount);
                tx.hincrby(kJob(id), fReleases, 1);
            }).then(a -> resolve(on(Response(RELEASED, id))));
        });
    }

    public Promise<Response> reserve(long blockTimeoutMsec) {
        long now = Platform.currentTimeMillis();
        NodeRedis r = getRedis();

        Observable<Long> readyQueueSize_ = rxLong(r.zcardAsync(kReadyQueue));
        Observable<Integer> copyToReadyQueue = readyQueueSize_.concatMap(readyQueueSize -> {
            if (readyQueueSize == 0) {
                Observable<Long> delayQueueSize_ = rxLong(r.zcardAsync(kDelayQueue));
                Observable<Integer> concatMap3 = delayQueueSize_.concatMap(delayQueueSize -> {
                    if (delayQueueSize == 0) {
                        return Observable.just(0);
                    }
                    Observable<String> delayedIds_ = rxArray(r.zrangebyscoreAsync(kDelayQueue, 0, now));
                    return prioritiesArray(r, delayedIds_).concatMap(arr -> rx(r.zaddAsync(kReadyQueue, arr)));
                });
                return concatMap3;
            }
            return Observable.just(0);
        });

        Observable<String> ids = rxArray(r.zrangeAsync(kReadyQueue, 0, 0));
        Observable<Job> jobs = ids.concatMap(id -> rx(_getJob(r, id)));
        Observable<Job> firstJob_ = jobs.filter(j -> j != null && !Job.BURIED.equals(j.state)).take(1);

        Observable<Response> responseRx = firstJob_.concatMap(j -> {
            return rx(updateRedisTransaction(tx -> {
                tx.hset(kJob(j.id), fState, Job.RESERVED);
                tx.zrem(kReadyQueue, j.id);
                tx.zadd(kDelayQueue, now + j.ttrMsec, j.id);
                tx.hincrby(kJob(j.id), fReserves, 1);
                tx.incr(kReserveCount);
            })).map(arr -> {
                return on(Response(RESERVED, j.id, j.data));
            });
        }).defaultIfEmpty(Response(TIMED_OUT, null, null));

        Observable<Response> responseRx_ = copyToReadyQueue.ignoreElements().concat((Observable) responseRx);
        return responseRx_.toPromise();
    }

    /**
     * The "touch" command allows a worker to request more time to work on a
     * job. This is useful for jobs that potentially take a long time, but you
     * still want the benefits of a TTR pulling a job away from an unresponsive
     * worker. A worker may periodically tell the server that it's still alive
     * and processing a job (e.g. it may do this on DEADLINE_SOON). The command
     * postpones the auto release of a reserved job until TTR seconds from when
     * the command is issued.
     * 
     * The touch command looks like this:
     * 
     * touch <id>\r\n
     * 
     * - <id> is the ID of a job reserved by the current connection.
     * 
     * There are two possible responses:
     * 
     * - "TOUCHED\r\n" to indicate success.
     * 
     * - "NOT_FOUND\r\n" if the job does not exist or is not reserved by the
     * client.
     */
    public Promise<Response> touch(String id) {
        return contains(id).then(_contains -> {
            if (!_contains) {
                return resolve(Response(NOT_FOUND, id));
            }
            NodeRedis r = getRedis();
            return _getJob(r, id).then(j -> {
                if (j == null || !Job.RESERVED.equals(j.state)) {
                    return resolve(Response(NOT_FOUND, id));
                }
                return r.zaddAsync(kDelayQueue, $array(currentTimeMillis() + j.ttrMsec, id)).then(x -> {
                    return resolve(on(Response(TOUCHED, id, j.data)));
                });
            });
        });
    }

    /**
     * The kick command applies only to the currently used tube. It moves jobs
     * into the ready queue. If there are any buried jobs, it will only kick
     * buried jobs. Otherwise it will kick delayed jobs. It looks like:
     * 
     * kick <bound>\r\n
     * 
     * - <bound> is an integer upper bound on the number of jobs to kick. The
     * server will kick no more than <bound> jobs.
     * 
     * The response is of the form:
     * 
     * KICKED <count>\r\n
     * 
     * - <count> is an integer indicating the number of jobs actually kicked.
     */
    public Promise<Integer> kick(int bound) {
        long now = currentTimeMillis();
        NodeRedis r = getRedis();
        Observable<String> idsRx = rxArray(r.zcardAsync(kBuried).then(buried -> {
            if (buried > 0) {
                return r.zrangeAsync(kBuried, 0, bound);
            }
            return r.zrangebyscoreAsync(kDelayQueue, 0., Double.POSITIVE_INFINITY, "limit", 0, bound);
        }));

        Observable<Array<Pair<String, Long>>> prisRx = priorities(r, idsRx).toArray().concatMap(pris -> {
            return rx(updateRedisTransaction(tx -> {
                pris.$forEach(p -> {
                    String id = p.key;
                    Long pri = p.value;
                    _kickJob(id, now, tx, pri);
                    on(Response(KICKED, id));
                });
            })).map(a -> pris);
        });
        return prisRx.count().toPromise();
    }

    /**
     * The kick-job command is a variant of kick that operates with a single job
     * identified by its job id. If the given job id exists and is in a buried
     * or delayed state, it will be moved to the ready queue of the the same
     * tube where it currently belongs. The syntax is:
     * 
     * kick-job <id>\r\n
     * 
     * - <id> is the job id to kick.
     * 
     * The response is one of:
     * 
     * - "NOT_FOUND\r\n" if the job does not exist or is not in a kickable
     * state. This can also happen upon internal errors.
     * 
     * - "KICKED\r\n" when the operation succeeded.
     */
    public Promise<Response> kickJob(String id) {
        long now = currentTimeMillis();
        return _isBuried(id).then(_buried -> {
            if (!_buried) {
                return resolve(Response(NOT_FOUND, id));
            }
            return _pri(getRedis(), id).concatMap(pri -> {
                return rx(updateRedisTransaction(tx -> _kickJob(id, now, tx, pri)));
            }).map(x -> on(Response(KICKED, id))).toPromise();
        });
    }

    private void _kickJob(String id, long now, Multi tx, long pri) {
        tx.zrem(kBuried, id);
        tx.hset(kJob(id), fState, Job.READY);
        tx.hincrby(kJob(id), fKicks, 1);
        tx.zadd(kReadyQueue, pri, id);
    }

    /**
     * The stats-job command gives statistical information about the specified
     * job if it exists. Its form is:
     * 
     * stats-job <id>\r\n
     * 
     * - <id> is a job id.
     * 
     * The response is one of:
     * 
     * - "NOT_FOUND\r\n" if the job does not exist.
     * 
     * - "OK <bytes>\r\n<data>\r\n"
     * 
     * - <bytes> is the size of the following data section in bytes.
     * 
     * - <data> is a sequence of bytes of length <bytes> from the previous line.
     * It is a YAML file with statistical information represented a dictionary.
     * 
     * The stats-job data is a YAML file representing a single dictionary of
     * strings to scalars. It contains these keys:
     * 
     * - "id" is the job id
     * 
     * - "tube" is the name of the tube that contains this job
     * 
     * - "state" is "ready" or "delayed" or "reserved" or "buried"
     * 
     * - "pri" is the priority value set by the put, release, or bury commands.
     * 
     * - "age" is the time in seconds since the put command that created this
     * job.
     * 
     * - "time-left" is the number of seconds left until the server puts this
     * job into the ready queue. This number is only meaningful if the job is
     * reserved or delayed. If the job is reserved and this amount of time
     * elapses before its state changes, it is considered to have timed out.
     * 
     * - "file" is the number of the earliest binlog file containing this job.
     * If -b wasn't used, this will be 0.
     * 
     * - "reserves" is the number of times this job has been reserved.
     * 
     * - "timeouts" is the number of times this job has timed out during a
     * reservation.
     * 
     * - "releases" is the number of times a client has released this job from a
     * reservation.
     * 
     * - "buries" is the number of times this job has been buried.
     * 
     * - "kicks" is the number of times this job has been kicked.
     */

    public Promise<Job> statsJob(String id) {
        return _getJob(getRedis(), id);
    }

    private static Observable<Long> rxLong(Promise<Double> promise) {
        return Observable.fromPromise(promise).map(d -> toLong(d));
    }

    private Observable<Array<Object>> prioritiesArray(NodeRedis r, Observable<String> ids) {
        return priorities(r, ids).reduce((arr, map) -> {
            arr.push(map.value, map.key);
            return arr;
        }, $array());
    }

    private Observable<Pair<String, Long>> priorities(NodeRedis r, Observable<String> ids) {
        return ids.concatMap(id -> _pri(r, id).map(pri -> Pair.of(id, pri)));
    }

    private static <T> Observable<T> rxArray(Promise<Array<T>> promise) {
        return Observable.fromPromise(promise).filter(x -> x != null).concatMap(arr -> Observable.from(arr));
    }

    private static <T> Observable<T> rx(Promise<T> promise) {
        return Observable.fromPromise(promise).filter(x -> x != null);
    }

    private static long toLong(Object zcard) {
        int i = parseInt(zcard);
        if (isNaN(i)) {
            return 0;
        }
        return i;
    }

    private Promise<Job> _getJob(NodeRedis r, String id) {
        long now = currentTimeMillis();
        Promise<Map<String, String>> _job = r.hgetallAsync(kJob(id));
        Promise<Job> then = _job.then(job -> {
            if (Platform.isEmptyMap(job))
                return Promise.resolve(null);

            Promise<Double> _readyTime = r.zscoreAsync(kDelayQueue, id);
            Promise<Job> jobp = _readyTime.then(readyTime -> {

                Job j = new Job();
                if (readyTime != null) {
                    j.readyTime = toLong(readyTime);
                } else {
                    j.readyTime = toLong(job.$get(fCtime));
                }
                j.tube = job.$get(fTube);
                j.state = job.$get(fState);
                if (Job.DELAYED.equals(j.state) || Job.RESERVED.equals(j.state)) {
                    if (j.readyTime <= now) {
                        j.state = Job.READY;
                    }
                }
                j.pri = toLong(job.$get(fPriority));
                j.data = substr(job.$get(fData), 0, 64 * 1024);
                job.$delete(fData);
                j.ttrMsec = toLong(job.$get(fTtr));
                j.id = id;
                j.reserves = toLong(job.$get(fReserves));
                j.releases = toLong(job.$get(fReleases));
                j.buries = toLong(job.$get(fBuries));
                j.kicks = toLong(job.$get(fKicks));
                j.timeouts = toLong(job.$get(fTimeouts));
                j.ctime = toLong(job.$get(fCtime));
                j.now = currentTimeMillis();
                j.error = job.$get(fBuryReason);
                return Promise.resolve(j);
            });
            return jobp;
        });
        return then;
    }

    private static String substr(String str, int start, int end) {
        if (str == null || str.length() < (end - start)){
            return str;
        }
        return str.substring(start, end);
    }

    public static class StatsTube {
        public String name;
        public long currentjobsUrgent;
        public long currentjobsready;
        public long currentjobsreserved;
        public long currentjobsdelayed;
        public long currentjobsburied;
        public long totaljobs;
        public long currentusing;
        public long currentwaiting;
        public long currentwatching;
        public long pause;
        public long cmddelete;
        public long cmdpausetube;
        public long pausetimeleft;
    }

    /**
     * The stats-tube data is a YAML file representing a single dictionary of
     * strings to scalars. It contains these keys:
     * 
     * - "name" is the tube's name.
     * 
     * - "current-jobs-urgent" is the number of ready jobs with priority < 1024
     * in this tube.
     * 
     * - "current-jobs-ready" is the number of jobs in the ready queue in this
     * tube.
     * 
     * - "current-jobs-reserved" is the number of jobs reserved by all clients
     * in this tube.
     * 
     * - "current-jobs-delayed" is the number of delayed jobs in this tube.
     * 
     * - "current-jobs-buried" is the number of buried jobs in this tube.
     * 
     * - "total-jobs" is the cumulative count of jobs created in this tube in
     * the current beanstalkd process.
     * 
     * - "current-using" is the number of open connections that are currently
     * using this tube.
     * 
     * - "current-waiting" is the number of open connections that have issued a
     * reserve command while watching this tube but not yet received a response.
     * 
     * - "current-watching" is the number of open connections that are currently
     * watching this tube.
     * 
     * - "pause" is the number of seconds the tube has been paused for.
     * 
     * - "cmd-delete" is the cumulative number of delete commands for this tube
     * 
     * - "cmd-pause-tube" is the cumulative number of pause-tube commands for
     * this tube.
     * 
     * - "pause-time-left" is the number of seconds until the tube is un-paused.
     */

    public Promise<StatsTube> statsTube() {
        long now = currentTimeMillis();
        NodeRedis r = getRedis();
        Multi m = r.multi();
        m.zcard(kReadyQueue);
        m.zcount(kDelayQueue, 0, now);
        m.zcount(kDelayQueue, now + 1, Double.POSITIVE_INFINITY);
        m.zcard(kBuried);
        m.get(kReserveCount);
        m.get(kDeleteCount);
        m.zcard(kDelayQueue);

        return m.execAsync().then(arr -> {
            long zkReadyQueue = toLong(arr.$get(0));
            long zkDelayQueueNow = toLong(arr.$get(1));
            long zkDelayQueueFuture = toLong(arr.$get(2));
            long zkBuried = toLong(arr.$get(3));
            long zkReserveCount = toLong(arr.$get(4));
            long zkDeleteCount = toLong(arr.$get(5));
            long zkDelayQueue = toLong(arr.$get(6));
            StatsTube stats = new StatsTube();
            stats.name = tube;
            stats.currentjobsready = zkReadyQueue + zkDelayQueueNow;
            stats.currentjobsdelayed = zkDelayQueueFuture;
            stats.currentjobsburied = zkBuried;
            stats.currentjobsreserved = zkReserveCount;
            stats.totaljobs = zkReadyQueue + zkDelayQueue + zkBuried + zkDeleteCount;
            stats.cmddelete = zkDeleteCount;
            return resolve(stats);
        });
    }

    public Observable<Job> statsJobs() {
        NodeRedis r = getRedis();
        Observable<String> buried = rxArray(r.zrangeAsync(kBuried, 0, -1));
        Observable<String> ready = rxArray(r.zrangeAsync(kReadyQueue, 0, -1));
        Observable<String> delayed = rxArray(r.zrangeAsync(kDelayQueue, 0, -1));
        Observable<String> ids = Observable.concat($array(buried, ready, delayed));
        return ids.concatMap(id -> rx(_getJob(r, id)));
    }
    
    public Observable<String> flushTube() {
        NodeRedis r = getRedis();
        Observable<String> buried = rxArray(r.zrangeAsync(kBuried, 0, -1));
        Observable<String> ready = rxArray(r.zrangeAsync(kReadyQueue, 0, -1));
        Observable<String> delayed = rxArray(r.zrangeAsync(kDelayQueue, 0, -1));
        Observable<String> ids = Observable.concat($array(buried, ready, delayed));
        return ids.concatMap(id -> rx(Delete(id)).map(_r -> _r.id));
    }
}
