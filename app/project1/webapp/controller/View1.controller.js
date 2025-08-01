sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
  ], function (Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";
  
	return Controller.extend("stajui.project1.controller.View1", {
  
	  onInit: function () {
		this.getView().setModel(new JSONModel({
		  items: [],
		  visible: false
		}), "documents");
	  },
  
	  onFileSelected: function (oEvent) {
		const oFileUploader = oEvent.getSource();
		const oFile = oEvent.getParameter("files")?.[0];
  
		if (!oFile) {
		  MessageBox.error("Dosya alınamadı!");
		  this._selectedFile = null;
		  return;
		}
  
		if (!oFile.name.toLowerCase().endsWith(".csv")) {
		  MessageBox.error("Sadece .csv uzantılı dosyalar yüklenebilir!");
		  oFileUploader.clear();
		  this.byId("filePath").setValue("");
		  this._selectedFile = null;
		  return;
		}
  
		const fileName = oFile.name;
		const fakePath = "C:\\" + fileName;
  
		this.byId("filePath").setValue(fakePath);
		this._selectedFile = oFile;
	  },
  
	  onUpload: function () {
		const file = this._selectedFile;
		const oUploadBtn = this.byId("uploadBtn");
		const oCancelBtn = this.byId("cancelbtn");
  
		if (!file) {
		  MessageBox.error("Lütfen bir .csv dosyası seçin!");
		  oUploadBtn.setEnabled(false);
		  oCancelBtn.setEnabled(false);
		  return;
		}
  
		const reader = new FileReader();
		reader.onload = (e) => {
		  const csv = e.target.result;
		  const json = this._parseCSV(csv);
  
		  if (!Array.isArray(json) || json.length === 0) {
			MessageBox.error("CSV İÇERİĞİ BOŞ VEYA HATALI");
			return;
		  }
  
		  const oModel = this.getView().getModel("documents");
		  oModel.setProperty("/items", json);
		  oModel.setProperty("/visible", true);
  
		  MessageToast.show("CSV başarıyla yüklendi.");
		  oUploadBtn.setEnabled(true);
		  oCancelBtn.setEnabled(true);
		};
  
		reader.readAsText(file);
	  },
  
	  _parseCSV: function (csvText) {
		const lines = csvText.trim().split("\n");
		const headers = lines[0].split(",");
  
		return lines.slice(1).map(line => {
		  const values = line.split(",");
		  const obj = {};
		  headers.forEach((header, i) => {
			obj[header.trim()] = values[i] ? values[i].trim() : "";
		  });
		  return obj;
		}).filter(item => item.ID && item.ID.trim() !== "");
	  },
  
	  onCancel: function () {
		this.byId("fileUploader").clear();
		this.byId("filePath").setValue("");
		this._selectedFile = null;
  
		const model = this.getView().getModel("documents");
		model.setProperty("/items", []);
		model.setProperty("/visible", false);
	  },
  
	  onImport: function () {
		const oModel = this.getView().getModel(); 
		let aItems = this.getView().getModel("documents").getProperty("/items");
  
		if (!aItems || aItems.length === 0) {
		  MessageBox.warning("Import edilecek veri yok!");
		  return;
		}
  
		const hasInvalid = aItems.some(item =>
		  !item.ID || !item.Name || !item.Birthday || !item.Avatar || !item.Position || !item.HireDate || !item.City
		);
  
		if (hasInvalid) {
		  sap.m.MessageBox.error("Bazı satırlarda eksik bilgi var. Lütfen veriyi kontrol edin.");
		  return;
		}
  
  
		const oListBinding = oModel.bindList("/People");
  
		aItems.forEach((item) => {
		  console.log(item);
		  oListBinding.create(item);
		});
  
		localStorage.setItem("importedData", JSON.stringify(aItems));
  
		oModel.submitBatch("auto").then(() => {
		  MessageToast.show('CSV dosyası kayıt başarıyla gönderildi.');
		  this.getOwnerComponent().getRouter().navTo("success");
  
		  this.getView().getModel("documents").setProperty("/items", []);
		  this.byId("filePath").setValue("");
		  const oFileUploader = this.byId("fileUploader");
		  if (oFileUploader) {
			oFileUploader.clear();
		  }
		}).catch((err) => {
		  MessageBox.error("Veriler gönderilirken hata oluştu.");
		  console.error(err);
		});
	  }
  
	});
  });
  
  
  