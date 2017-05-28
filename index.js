var EventEmitter = require('events').EventEmitter
, util = require('util')
, _ = require('lodash')
, async = require("async");

function JobQueue(options, generator, processor, callback){
    options = typeof options === 'object' ? options : {};
    options.maxJobs = options.maxJobs ? options.maxJobs : 5; 

  var activeJobs = 0;
 
  //  when generator done  
  //  activeJobs = 0;
  //  end of task queue 
  var noMoreJob = false;
  
  const jobQueueEmitter = new EventEmitter();

  function done(){

      if(activeJobs > 0){
          activeJobs--;
      }else{
          // throw error
      }
      
      console.log(activeJobs);

      if(noMoreJob){
          if(0 >= activeJobs){
            jobQueueEmitter.emit('end');
          } 
      }else{
          jobQueueEmitter.emit('enque');
      }

  }

  jobQueueEmitter.on('enque', function(){

      // enque jobs when there is cap
      if(activeJobs < options.maxJobs){
          // the description of the new job
          var newJob = generator.next();
          if(!newJob.done){
              activeJobs++;
              console.log(activeJobs);
              // accepts the description of new job, and callback notifier for done
//              process.nextTick(function(){processor(newJob, done)});
              processor(newJob, done)
          }else{
            noMoreJob = true;
            console.log("AAA");
            if(0 >= activeJobs){
              jobQueueEmitter.emit('end');
            } 
          }
      }

  });

  jobQueueEmitter.on('end', function(e){
    callback && callback(e);
  });

  _.times(options.maxJobs, function(){
        jobQueueEmitter.emit('enque');
  });
}

function* gen(){
    var i = 0;
    while(i <= 20){
      yield i++; 
    }
}

var jq = new JobQueue({} 
, gen()
, function(job, done){
  console.log("Doing job ... ", job.value);
  //setTimeout(function(){
  done();
  //}, 0);
}, function(){
   console.log("All job done");
});
