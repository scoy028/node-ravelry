module.exports = function(that) {
    var common = require('../utilities/commonCalls.js')(that);
    return {
        archive: function (id, cb){
            common.post(`/messages/${id}/archive.json`, cb);
        },
        create: function (params, cb){
            common.postParams('/messages/create.json', params, cb);
        },
        delete: function (id, cb){
            common.post(`/messages/${id}.json`, cb);
        },
        list: function (params, cb){
            common.getParams('/messages/list.json', params, cb);
        },
        markRead: function (id, cb){
            common.post(`/messages/${id}/mark_read.json`, cb);
        },
        markUnread: function (id, cb){
            common.post(`/messages/${id}/mark_unread.json`, cb);
        },
        reply: function (id, params, cb){
            common.postParams(`/messages/${id}/reply.json`, params, cb);
        },
        show: function (id, cb){
            common.get(`/messages/${id}.json`, cb);
        },
        unarchive: function (id, cb){
            common.post(`/messages/${id}/unarchive.json`, cb);
        }
    };
};
