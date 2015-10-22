var Z1 = (function(global) {
  var seq = 0;
  var jobs = (global["__z1_mr_jobs"] = []);

  var mkMapTableTask = function(opts) {
    var job_id = mkJobID();

    var map_fn_id = mkFnID();
    global[map_fn_id] = opts["map_fn"];

    jobs.push({
      id: job_id,
      op: "map_table",
      table_name: opts["table"],
      from: opts["from"],
      until: opts["until"],
      method_name: map_fn_id
    });

    return job_id;
  };

  var mkReduceTask = function(opts) {
    var job_id = mkJobID();

    var reduce_fn_id = mkFnID();
    global[reduce_fn_id] = opts["reduce_fn"];

    jobs.push({
      id: job_id,
      op: "reduce",
      sources: opts["sources"],
      num_shards: opts["shards"],
      method_name: reduce_fn_id
    });

    return job_id;
  };

  var mkDownloadResultsTask = function(sources) {
    var job_id = mkJobID();

    jobs.push({
      id: job_id,
      op: "return_results",
      sources: sources
    });

    return job_id;
  };

  var mkJobID = function() {
    return "job-" + ++seq;
  };

  var mkFnID = function() {
    return "__z1_mr_fn_" + ++seq;
  };

  return {
    mapTable: mkMapTableTask,
    reduce: mkReduceTask,
    downloadResults: mkDownloadResultsTask
  };
})(this);
