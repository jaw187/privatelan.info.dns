// Load modules
var Net = require('net');
var Named = require('node-named');


// Declare internals
var internals = {
    ttl: 60 * 24 * 5,
    port: 53
};


var Server = Named.createServer();
var ARecord = Named.ARecord;

Server.on('query', function (query) {

    var domain = query.name() || '';
    var subDomains = domain.split('.');
    var octets = subDomains.slice(0,4);

    if (octets.length !== 4 || subDomains[subDomains.length - 1] === 'arpa') {
        return Server.send(query);
    }

    var ipString = octets[0] + '.' + octets[1] + '.' + octets[2] + '.' + octets[3];
    if (Net.isIPv4(ipString) === 0) {
        return Server.send(query);
    }

    var target = new ARecord(ipString);

    query.addAnswer(domain, target, internals.ttl);
    Server.send(query);
});

Server.listen(internals.port, function() {

    console.log('DNS server started on port ' + internals.port);
});
