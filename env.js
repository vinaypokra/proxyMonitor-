const ENVIRONMENTS = {
  dev: {
    "generic-service": "https://dcbs-dev.pe-lab1.bdc-rancher.tecnotree.com/generic-service",
    ngb: "https://pe-lab1-dev.tecnotree.com/ngb",
    "collections-service": "https://dcbs-dev-ndb.pe-lab1.bdc-rancher.tecnotree.com/collections-service",
    "collections-service": "http://localhost:9107/collections-service",

  },
  qc: {
    "generic-service": "https://collections-mysql.pe-lab1.bdc-rancher.tecnotree.com/generic-service",
    ngb: "https://collections-mysql.pe-lab1.bdc-rancher.tecnotree.com/ngb",
    "collections-service": "https://collections-mysql.pe-lab1.bdc-rancher.tecnotree.com/collections-service",
  },
};

let activeEnv = "dev";

function getEnv() {
  return { activeEnv, envURL: ENVIRONMENTS[activeEnv] };
}

function setEnv(env) {
  if (!ENVIRONMENTS[env]) throw new Error("Invalid env");
  activeEnv = env;
}

module.exports = { ENVIRONMENTS, getEnv, setEnv };
