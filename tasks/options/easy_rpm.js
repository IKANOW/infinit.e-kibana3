module.exports = function(config, grunt) {
  return {
    options: {
      name: "ikanow-<%= pkg.name %>",
      version: "<%= pkg.version %>",
      release: "<%= pkg.buildNumber %>",
      buildArch: "noarch",
      summary: "Forked embeddable Kibana",
      description: "Kibana3 Fork to support parent controllers and iframe embedding",
      license: "AFL-2.0",
      vendor: "Ikanow LLC",
      rpmDestination: "<%= targetDir%>",
      requires: ["ikanow-management_db-engine"]
    },
    release: {
      files: [
        { cwd: "target", src: "*.war", dest: "/opt/tomcat-infinite/interface-engine/webapps/"}
      ]
    }
  };
};