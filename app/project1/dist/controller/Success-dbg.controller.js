sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/export/Spreadsheet"

], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("kisitakip.project1.controller.success", {
    

    onInit: async function () {
      const data = JSON.parse(localStorage.getItem("importedData") || "[]");
      const oODataModel = this.getOwnerComponent().getModel(); 
    
     
      for (let i = 0; i < data.length; i++) {
        const id = data[i].ID;
    
        try {
          const oContext = oODataModel.bindContext(`/People(${id})`);
          const oData = await oContext.requestObject();
          data[i].Age = oData?.Age || "N/A";
        } catch (err) {
          data[i].Age = "N/A";
        }
      }
  


      

      const oEditModel = new JSONModel({ items: data });
      const oFilterModel = new JSONModel({
        Name: "",
        Birthday: "",
        Age: "",
        Cıty:"",
        Position:"",
        HireDate:"",
        TerminationDate:""
      });

      this.getView().setModel(oEditModel, "editModel");
      this.getView().setModel(oFilterModel, "filterModel");

      const oAbsenceModel = new JSONModel({
        Person_ID: "",
        StartDate: null,
        EndDate: null,
        Type: "",
        Reason: ""
      });
      this.getView().setModel(oAbsenceModel, "absenceModel");
    
      
     



      MessageToast.show("Veriler başarıyla kaydedildi!", {
        duration: 3000,
        my: "begin bottom",
        at: "begin bottom"
      });
    },


    

   
    
    onSearch: async function (oEvent) {
      const searchValue = oEvent.getParameter("value").trim();
      const oModel = this.getView().getModel();
     
    
      
      const oBinding = oModel.bindList("/People", null, null, null, {
        $select: "ID,Name,Birthday,Age,City,Position,HireDate,Avatar,TerminationDate"
      });
      const aContexts = await oBinding.requestContexts(0, 1000);
      const allItems = aContexts.map(ctx => ctx.getObject());
      
    
      if (!searchValue) {
        this.getView().getModel("editModel").setProperty("/items", allItems);
        return;
      }
    
      const filtered = allItems.filter(item => {
        const idMatch = item.ID !== undefined && item.ID.toString() === searchValue;
        const nameMatch = item.Name && item.Name.toLowerCase().includes(searchValue.toLowerCase());
        const birthdayMatch = item.Birthday && item.Birthday.toLowerCase().includes(searchValue.toLowerCase());
        const ageMatch = item.Age !== undefined && item.Age.toString().includes(searchValue);
        const cityMatch = item.City && item.City.toLowerCase().includes(searchValue.toLowerCase());
        const hireDateMatch = item.HireDate && item.HireDate.toLowerCase().includes(searchValue.toLowerCase());
        const positionMatch = item.Position && item.Position.toLowerCase().includes(searchValue.toLowerCase());
    
        return idMatch || nameMatch || birthdayMatch || ageMatch || cityMatch || hireDateMatch || positionMatch;
      });
    
      if (filtered.length === 0) {
        sap.m.MessageToast.show("Eşleşen kayıt bulunamadı.");
      }
    
      this.getView().getModel("editModel").setProperty("/items", filtered);
    },
    
   

    

    onBirthdayChange: function (oEvent) {
      const date = oEvent.getSource().getDateValue();
      const today = new Date();

  

      if (!date) return;

      const selectedDate = new Date(date.setHours(0, 0, 0, 0));
      const currentDate = new Date(today.setHours(0, 0, 0, 0));

      if (selectedDate > currentDate) {
        MessageBox.error("Gelecekte bir doğum tarihi giremezsiniz!");
        oEvent.getSource().setValue("");
        return;
      }

      let age = currentDate.getFullYear() - selectedDate.getFullYear();
      const m = currentDate.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && currentDate.getDate() < selectedDate.getDate())) {
        age--;
      }

      const bindingPath = oEvent.getSource().getBindingContext("editModel").getPath();
      const oEditModel = this.getView().getModel("editModel");

      oEditModel.setProperty(bindingPath + "/Birthday", selectedDate.toISOString().split("T")[0]);
      oEditModel.setProperty(bindingPath + "/Age", age);
      oEditModel.setProperty(bindingPath + "/_dirty", true);
    },





    onDelete: function (oEvent) {
      var oBtn = oEvent.getSource();
      var oCtx = oBtn.getBindingContext("editModel"); 
      var sID = oCtx.getObject().ID;
    
      var oUIModel = this.getView().getModel("editModel");
      var aItems = oUIModel.getProperty("/items");
    
      MessageBox.confirm("ID " + sID + " olan kaydı silmek istiyor musunuz?", {
        onClose: (oAction) => {
          if (oAction !== MessageBox.Action.OK) return;
    
          
          var index = aItems.findIndex(function (item) {
            return item.ID == sID; 
          });
          if (index > -1) {
            aItems.splice(index, 1);
            oUIModel.setProperty("/items", aItems); 
          }
    
          
          var oModel = this.getView().getModel(); 
          var oListBinding = oModel.bindList("/People");
    
          oListBinding.requestContexts(0, 1000).then((aContexts) => {
            var oDataCtx = aContexts.find((ctx) => ctx.getObject().ID == sID);
            if (oDataCtx) {
              oDataCtx.delete().then(() => {
                MessageToast.show("Veri başarıyla silindi.");
              }).catch((err) => {
                MessageBox.error("Veri silinirken hata oluştu.");
                console.error(err);
              });
            } else {
              MessageBox.error("Silinecek kayıt HANA'da bulunamadı.");
            }
          }).catch((err) => {
            MessageBox.error("Bağlam alınırken hata oluştu.");
            console.error(err);
          });
        }
      });
    }
,    
    
    
    


    onUpdate: async function (oEvent) {
      const oEditModel = this.getView().getModel("editModel");
      const oModel = this.getView().getModel();
    
      const sPath = oEvent.getSource().getBindingContext("editModel").getPath();
      const oData = oEditModel.getProperty(sPath);
      const sKey = "/People(" + oData.ID + ")";
      const yeniYas = parseInt(oData.Age, 10);
    
      const today = new Date();
      const yeniBirthday = new Date(today.setFullYear(today.getFullYear() - yeniYas));
      const formattedBirthday = yeniBirthday.toISOString().split("T")[0];
    
      const oBinding = oModel.bindContext(sKey, null, { $$updateGroupId: "auto" });
      await oBinding.requestObject();
    
      const oContext = oBinding.getBoundContext();
      const eskiYas = parseInt(oContext.getProperty("Age"), 10);
    
      if (yeniYas === eskiYas) {
        oEditModel.setProperty(sPath + "/_dirty", false); 
        oEditModel.checkUpdate(true); 
        MessageToast.show("Yaşta değişiklik yapılmadı.");
        return;
      }
    
      oContext.setProperty("Age", yeniYas);
      oContext.setProperty("Birthday", formattedBirthday);
      await oModel.submitBatch("auto");
    
      MessageToast.show("Yaş ve doğum tarihi başarıyla güncellendi.");
      oEditModel.setProperty(sPath + "/_dirty", false);
      oEditModel.checkUpdate(true);
    }
,    

onAdd: function () {
  const id = this.byId("inputID").getValue();
  const name = this.byId("inputName").getValue();
  const birthdayDate = this.byId("inputBirthday").getDateValue();
  const avatarUrl = this.byId("inputAvatar").getValue();
  const city = this.byId("inputCity").getValue();
  const position = this.byId("inputPosition").getValue(); 
  const hireDateValue = this.byId("inputHireDate").getDateValue(); 

  
  if (!id || !name || !birthdayDate || !avatarUrl || !city || !position || !hireDateValue) {
    MessageToast.show("Lütfen tüm alanları doldurun.");
    return;
  }

  const today = new Date();
  const selectedBirthday = new Date(birthdayDate.setHours(0, 0, 0, 0));
  const selectedHireDate = new Date(hireDateValue.setHours(0, 0, 0, 0));

  if (selectedBirthday > today || selectedHireDate > today) {
    MessageBox.error("Gelecekte bir tarih giremezsiniz!");
    return;
  }

  
  let age = today.getFullYear() - selectedBirthday.getFullYear();
  const m = today.getMonth() - selectedBirthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < selectedBirthday.getDate())) {
    age--;
  }

  const formattedBirthday = selectedBirthday.toISOString().split("T")[0];
  const formattedHireDate = selectedHireDate.toISOString().split("T")[0];

  const oModel = this.getView().getModel(); 
  const oBinding = oModel.bindList("/People");

  const oNewEntry = {
    ID: id,
    Name: name,
    Birthday: formattedBirthday,
    Age: age,
    Avatar: avatarUrl,
    City: city,
    Position: position,
    HireDate: formattedHireDate
  };

  const oContext = oBinding.create(oNewEntry);

  oContext.created().then(() => {
    MessageToast.show("Kullanıcı başarıyla eklendi!");

    

    const oTableModel = this.getView().getModel("editModel");
    const aItems = oTableModel.getProperty("/items");
    aItems.push(oContext.getObject());
    oTableModel.setProperty("/items", aItems);

    this.byId("inputID").setValue("");
    this.byId("inputName").setValue("");
    this.byId("inputBirthday").setDateValue(null);
    this.byId("inputAvatar").setValue("");
    this.byId("inputCity").setValue("");
    this.byId("inputPosition").setValue("");
    this.byId("inputHireDate").setDateValue(null);

    
    setTimeout(() => {
      this._drawCharts();
    }, 200);

  }).catch((oError) => {
    MessageBox.error("Hata: " + oError.message);
  });
}


,

    onSortAge: function () {
      const aItems = this.getView().getModel("editModel").getProperty("/items");

      const bAsc = !this._bAgeSortAsc;
      this._bAgeSortAsc = bAsc;

      aItems.sort((a, b) => bAsc ? a.Age - b.Age : b.Age - a.Age);
      this.getView().getModel("editModel").setProperty("/items", aItems);

      const oTable = this.byId("IDGenTable");
      const oSortButton = oTable.getColumns()[2].getHeader().getItems()[1];
      oSortButton.setIcon(bAsc ? "sap-icon://sort-ascending" : "sap-icon://sort-descending");
    },


    onExportToExcel: function () {
  const aCols = [
    { label: "ID", property: "ID" },
    { label: "Name", property: "Name" },
    { label: "Birthday", property: "Birthday" },
    { label: "Age", property: "Age" },
    { label: "City", property: "City" },
    { label: "Position", property: "Position" },       
    { label: "Hire Date", property: "HireDate" }       
  ];

  const aItems = this.getView().getModel("editModel").getProperty("/items");

  const oSettings = {
    workbook: {
      columns: aCols
    },
    dataSource: aItems,
    fileName: "KayitliKisiler.xlsx"
  };

  const oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
  oSpreadsheet.build()
    .then(() => {
      sap.m.MessageBox.information("Excel başarıyla indirildi. Excel Online'da açmak ister misiniz?", {
        actions: ["Aç", "Kapat"],
        emphasizedAction: "Aç",
        onClose: function (sAction) {
          if (sAction === "Aç") {
            window.open("https://www.office.com/launch/excel", "_blank");
          }
        }
      });
    })
    .catch((err) => {
      sap.m.MessageBox.error("Excel indirilemedi.");
      console.error(err);
    });
},

_drawCharts: function () {
  const oTable = this.byId("_IDGenTable");
  if (!oTable) return;

  const requiredCanvases = [
    "ageChart", "genderChart", "birthYearChart", "cityChart", "positionChart", "hireYearChart"
  ];

  const allExist = requiredCanvases.every(id => document.getElementById(id));
  if (!allExist) {
    console.warn("Bazı canvas elementleri DOM'da bulunamadı.");
    return;
  }

  const aItems = oTable.getItems();
  const ageData = {};
  const genderData = {};
  const birthYearData = {};
  const cityData = {};
  const positionData = {};
  const hireYearData = {};

  const tahminiCinsiyet = (name) => {
    const kadınIsimleri = ["Zeynep", "Elif", "Ayşe", "Fatma", "Hatice"];
    const erkekIsimleri = ["Mehmet", "Emre", "Can", "Ahmet", "Ali", "Furkan Aksoy "];
    const ilkIsim = name?.split(" ")[0];
    if (kadınIsimleri.includes(ilkIsim)) return "Kadın";
    if (erkekIsimleri.includes(ilkIsim)) return "Erkek";
    return "Bilinmiyor";
  };

  aItems.forEach(item => {
    const oData = item.getBindingContext("editModel")?.getObject();
    if (
      !oData ||
      !oData.Birthday ||
      !oData.Name ||
      !oData.City ||
      !oData.Position ||
      !oData.HireDate
    ) return;

    const age = oData.Age;
    const birthYear = new Date(oData.Birthday).getFullYear();
    const hireYear = new Date(oData.HireDate).getFullYear();
    const gender = tahminiCinsiyet(oData.Name);
    const city = oData.City;
    const position = oData.Position;

    ageData[age] = (ageData[age] || 0) + 1;
    birthYearData[birthYear] = (birthYearData[birthYear] || 0) + 1;
    genderData[gender] = (genderData[gender] || 0) + 1;
    cityData[city] = (cityData[city] || 0) + 1;
    positionData[position] = (positionData[position] || 0) + 1;
    hireYearData[hireYear] = (hireYearData[hireYear] || 0) + 1;
  });

  
  this.chartAge?.destroy();
  this.chartGender?.destroy();
  this.chartBirthYear?.destroy();
  this.chartCity?.destroy();
  this.chartPosition?.destroy();
  this.chartHireYear?.destroy();

  const commonBarOptions = {
    options: {
      plugins: { title: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  };

  
  this.chartAge = new Chart(document.getElementById("ageChart"), {
    type: "bar",
    data: {
      labels: Object.keys(ageData),
      datasets: [{
        label: "Yaş Dağılımı",
        data: Object.values(ageData),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }]
    },
    ...commonBarOptions,
    options: {
      ...commonBarOptions.options,
      plugins: { title: { display: true, text: "Yaş Dağılımı" } }
    }
  });

  
  this.chartGender = new Chart(document.getElementById("genderChart"), {
    type: "pie",
    data: {
      labels: Object.keys(genderData),
      datasets: [{
        label: "Cinsiyet Dağılımı",
        data: Object.values(genderData),
        backgroundColor: ["#ff6384", "#36a2eb", "#cccccc"]
      }]
    },
    options: {
      plugins: { title: { display: true, text: "Cinsiyet Dağılımı" } }
    }
  });

  
  this.chartBirthYear = new Chart(document.getElementById("birthYearChart"), {
    type: "bar",
    data: {
      labels: Object.keys(birthYearData),
      datasets: [{
        label: "Doğum Yılı Dağılımı",
        data: Object.values(birthYearData),
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1
      }]
    },
    ...commonBarOptions,
    options: {
      ...commonBarOptions.options,
      plugins: { title: { display: true, text: "Doğum Yılı Dağılımı" } }
    }
  });

  
  this.chartCity = new Chart(document.getElementById("cityChart"), {
    type: "bar",
    data: {
      labels: Object.keys(cityData),
      datasets: [{
        label: "Şehir Dağılımı",
        data: Object.values(cityData),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    ...commonBarOptions,
    options: {
      ...commonBarOptions.options,
      plugins: { title: { display: true, text: "Şehir Dağılımı" } }
    }
  });

  
  if (Object.keys(positionData).length > 0) {
    this.chartPosition = new Chart(document.getElementById("positionChart"), {
      type: "bar",
      data: {
        labels: Object.keys(positionData),
        datasets: [{
          label: "Pozisyon Dağılımı",
          data: Object.values(positionData),
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
            "rgba(255, 159, 64, 0.5)"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        }]
      },
      ...commonBarOptions,
      options: {
        ...commonBarOptions.options,
        plugins: {
          title: {
            display: true,
            text: "Pozisyon Dağılımı"
          },
          legend: {
            display: false
          }
        }
      }
    });
  }
  

  
  this.chartHireYear = new Chart(document.getElementById("hireYearChart"), {
    type: "bar",
    data: {
      labels: Object.keys(hireYearData),
      datasets: [{
        label: "İşe Başlama Yılı",
        data: Object.values(hireYearData),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1
      }]
    },
    ...commonBarOptions,
    options: {
      ...commonBarOptions.options,
      plugins: { title: { display: true, text: "İşe Başlama Yılı Dağılımı" } }
    }
  });
},

onStatsPanelExpand: function (oEvent) {
  const bExpanded = oEvent.getParameter("expand");
  if (bExpanded) {
    const that = this;
    setTimeout(function () {
      that._drawCharts();
      that.chartAge?.resize();
      that.chartGender?.resize();
      that.chartBirthYear?.resize();
      that.chartCity?.resize();
      that.chartPosition?.resize();
      that.chartHireYear?.resize();
    }, 500);
  }
},

onThemeChange: function (oEvent) {
  const sSelectedKey = oEvent.getSource().getSelectedKey();
  sap.ui.getCore().applyTheme(sSelectedKey);
}
,

onAddAbsence: function () {
  const oView = this.getView();
  const oModel = oView.getModel(); 
  const oData = oView.getModel("absenceModel").getData();

  const startDate = this.byId("inputAbsenceStart").getDateValue();
  const endDate = this.byId("inputAbsenceEnd").getDateValue();

  const isValidDate = (d) => d instanceof Date && !isNaN(d);

  if (!oData.ID) {
    MessageBox.error("Lütfen bir ID girin.");
    return;
  }

  if (!isValidDate(startDate)) {
    MessageBox.error("Lütfen geçerli bir başlangıç tarihi girin.");
    return;
  }

  if (!isValidDate(endDate)) {
    MessageBox.error("Lütfen geçerli bir bitiş tarihi girin.");
    return;
  }

  const oListBinding = oModel.bindList("/Absences", undefined, [], null, {
    $$groupId: "createGroup"
  });

  const oNewContext = oListBinding.create({
    ID: oData.ID,
    Name: oData.Name,
    StartDate: startDate.toISOString().split("T")[0],
    EndDate: endDate.toISOString().split("T")[0],
    Type: oData.Type
  });

  oNewContext.created().then(() => {
    MessageToast.show("İzin kaydı başarıyla eklendi!");
    oView.getModel("absenceModel").setData({});
    oModel.refresh(); 
  }).catch((err) => {
    MessageBox.error("Hata oluştu: " + err.message);
  });
}
,

onDeleteAbsence: function (oEvent) {
  const oModel = this.getView().getModel(); 
  const oItem = oEvent.getSource().getParent(); 
  const oContext = oItem.getBindingContext(); 

  if (!oContext) {
    MessageBox.error("Silinecek kayıt bulunamadı.");
    return;
  }

  
  MessageBox.confirm("Bu kaydı silmek istediğinizden emin misiniz?", {
    onClose: (sAction) => {
      if (sAction === "OK") {
        oContext.delete().then(() => {
          MessageToast.show("Kayıt başarıyla silindi.");
          oModel.refresh(); 
        }).catch((err) => {
          MessageBox.error("Silme hatası: " + err.message);
        });
      }
    }
  });
},
onToView3: function () {
  console.log("View3'e geçiliyor...");
  this.getOwnerComponent().getRouter().navTo("View3");
  

},



onFireTerminate: async function (oEvent) {
  const oEditModel = this.getView().getModel("editModel");
  const oModel = this.getView().getModel(); 
  const sPath = oEvent.getSource().getBindingContext("editModel").getPath();
  const oData = oEditModel.getProperty(sPath);
  const sKey = `/People(${oData.ID})`;

  MessageBox.confirm("Bu kişiyi işten çıkarmak istiyor musunuz?", {
    onClose: async (oAction) => {
      if (oAction !== MessageBox.Action.OK) return;

      const today = new Date().toISOString().split("T")[0];

      try {
        
        const oBinding = oModel.bindContext(sKey, null, { $$updateGroupId: "auto" });
        await oBinding.requestObject();
        const oContext = oBinding.getBoundContext();

        oContext.setProperty("TerminationDate", today);
        await oModel.submitBatch("auto");

        
        let aItems = oEditModel.getProperty("/items");
        const filteredItems = aItems.filter(item => item.ID !== oData.ID); 

        oEditModel.setProperty("/items", []); 
        setTimeout(() => {
          oEditModel.setProperty("/items", filteredItems); 
        }, 0);

        MessageToast.show("Kişi işten çıkarıldı.");
      } catch (err) {
        MessageBox.error("Veritabanı güncellenemedi: " + err.message);
        console.error("❌ PATCH hatası:", err);
      }
    }
  });
},

onBack: function () {
  this.getOwnerComponent().getRouter().navTo("View1");
},



});
});