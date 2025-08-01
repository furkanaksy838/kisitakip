sap.ui.define([
    "sap/ui/core/UIComponent",
    "stajui/project1/model/models",
    "sap/ui/model/odata/v4/ODataModel"  
  ], function (UIComponent, models, ODataModel) {
    "use strict";
  
    return UIComponent.extend("stajui.project1.Component", {
      metadata: {
        manifest: "json",
        interfaces: [
          "sap.ui.core.IAsyncContentCreation"
        ]
      },
  
      init: function () {
        
        UIComponent.prototype.init.apply(this, arguments);
  
        
        this.setModel(models.createDeviceModel(), "device");
  
        const oDataModel = new ODataModel({
          serviceUrl: "/odata/v4/People/"
        });
        this.setModel(oDataModel); // Default model olarak setleniyor
  
        // Routing
        this.getRouter().initialize();
      },
      
    });
  });