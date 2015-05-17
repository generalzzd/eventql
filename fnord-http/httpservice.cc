/**
 * This file is part of the "FnordMetric" project
 *   Copyright (c) 2014 Paul Asmuth, Google Inc.
 *
 * FnordMetric is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License v3.0. You should have received a
 * copy of the GNU General Public License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 */
#include <fnord-base/inspect.h>
#include <fnord-base/logging.h>
#include "fnord-http/httpserverconnection.h"
#include <fnord-http/httpservice.h>
#include <fnord-http/httpresponsestream.h>

namespace fnord {
namespace http {

void HTTPService::handleHTTPRequest(
      HTTPRequest* req,
      HTTPResponseStream* res_stream) {
  HTTPResponse res;
  res.populateFromRequest(*req);
  handleHTTPRequest(req, &res);

  auto body_size = res.body().size();
  if (body_size > 0) {
    res.setHeader("Content-Length", StringUtil::toString(body_size));
  }

  res_stream->startResponse(res);
}

HTTPServiceHandler::HTTPServiceHandler(
    StreamingHTTPService* service,
    TaskScheduler* scheduler,
    HTTPServerConnection* conn,
    HTTPRequest* req) :
    service_(service),
    scheduler_(scheduler),
    conn_(conn),
    req_(req) {}

void HTTPServiceHandler::handleHTTPRequest() {
  conn_->readRequestBody([this] (
      const void* data,
      size_t size,
      bool last_chunk) {
    req_->appendBody((char *) data, size);

    if (last_chunk) {
      dispatchRequest();
    }
  });
}

void HTTPServiceHandler::dispatchRequest() {
  auto runnable = [this] () {
    auto resp_stream = new HTTPResponseStream(conn_);
    resp_stream->incRef();

    try {
      service_->handleHTTPRequest(req_, resp_stream);
    } catch (const std::exception& e) {
      logError("fnord.http.service", e, "Error while processing HTTP request");

      if (!resp_stream->isOutputStarted()) {
        http::HTTPResponse res;
        res.setStatus(http::kStatusInternalServerError);
        res.addBody("server error");
        resp_stream->startResponse(res);
      }
    }

    resp_stream->finishResponse();
  };

  if (scheduler_ == nullptr) {
    runnable();
  } else {
    scheduler_->run(runnable);
  }
}

}
}

