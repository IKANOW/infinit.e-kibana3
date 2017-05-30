module.exports = function(config, grunt) {
  return {
    target: {
      options: {
        war_dist_folder: '<%= targetDir %>',    /* Folder where to generate the WAR. */
        war_name: 'kibana3.war',      /* The name fo the WAR file (.war will be the extension) */
        webxml_welcome: 'index.html',
        webxml_display_name: 'Kibana 3'
      },
      files: [
        {
          expand: true,
          cwd: '<%= destDir %>',
          src: ['**'],
          dest: ''
        }
      ]
    }
  };
};