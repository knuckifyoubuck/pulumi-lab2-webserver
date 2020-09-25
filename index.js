const gcp = require("@pulumi/gcp");

// Create a network
const network = new gcp.compute.Network("network");
const computeFirewall = new gcp.compute.Firewall("firewall", {
    network: network.id,
    allows: [{
        protocol: "tcp",
        ports: [ "22", "80" ],
    }],
});

const startupScript = `#!/bin/bash
echo "Hello, World!" > index.html
nohup python -m SimpleHTTPServer 80 &`;

const computeInstance = new gcp.compute.Instance("instance", {
    machineType: "f1-micro",
    zone: "us-central1-a",
    metadataStartupScript: startupScript,
    bootDisk: { initializeParams: { image: "debian-cloud/debian-9" } },
    networkInterfaces: [{
        network: network.id,
        // accessConfigus must include a single empty config to request an ephemeral IP
        accessConfigs: [{}],
    }],
});

// Export the name and IP address of the Instance
exports.instanceName = computeInstance.name;
exports.instanceIP = computeInstance.networkInterfaces.apply(ni => ni[0].accessConfigs[0].natIp);
