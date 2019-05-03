let device = require("tns-core-modules/platform");

const application = require("tns-core-modules/application");
if((device.device.language).includes("it"))
    require('tns-i18n')('it');
else if((device.device.language).includes("en"))
    require('tns-i18n')('en');
else if((device.device.language).includes("fr"))
    require('tns-i18n')('fr');
else
    require('tns-i18n')('en');

application.run({ moduleName: "app-root" });