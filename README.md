# rtalkjs
RTalk for JavaScript

`npm install -g rtalkjs`

```
rtalk 

  Usage: rtalk [options] [command]


  Commands:

    stats-tube            
    kick-job <jobid>      
    bury [options] <jobid>
    reserve               
    touch <jobid>         
    stats-jobs [options]  
    flush

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -u, --url [url]    Redis URL [redis://localhost:6379/0]
    -t, --tube [tube]  RTalk tube to use [default]
```

## Show jobs in a tube

Default redis location

`rtalk -t myTube stats-jobs -H`

Custom redis location

`rtalk -u redis://localhost:6379/0 -t myTube stats-jobs -H`

