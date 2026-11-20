module.exports = function createPlotterExtension(app, pluginId, version) {
  const panel = "watermaker";
  const manifest = {
    name: "Brineomatic",
    description: "View watermaker status and controls from the chart.",
    version,
    apiVersion: "1",
    requires: ["buttons", "panels.iframe", "windows"],
    buttons: [{
      id: panel,
      title: "Brineomatic",
      slot: "mapToolbar",
      icon: "water_drop",
      action: {
        type: "toggleWindow",
        panel,
        geometry: { anchor: "top-right", width: 1120, height: 820 },
        // Let Freeboard save the new geometry independently of the smaller layout.
        restoreKey: "brineomatic-dashboard",
      },
    }],
    panels: [{
      id: panel,
      title: "Brineomatic",
      type: "iframe",
      url: `/${pluginId}/dashboard.html`,
    }],
  };
  let running = false;

  function rejectWrite() {
    throw new Error(`${pluginId} is a read-only provider`);
  }

  return {
    start() {
      if (typeof app.registerResourceProvider !== "function")
        return;
      app.registerResourceProvider({
        type: "plotterExtensions",
        methods: {
          listResources: async () => running ? { [pluginId]: manifest } : {},
          getResource: async (id) => {
            if (!running || id !== pluginId)
              throw new Error(`No such plotterExtensions resource: ${id}`);
            return manifest;
          },
          setResource: async () => rejectWrite(),
          deleteResource: async () => rejectWrite(),
        },
      });
      running = true;
    },
    stop() {
      running = false;
    },
  };
};
