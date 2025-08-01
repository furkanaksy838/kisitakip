namespace kisitakip.db;

entity Person {
  key ID       : Integer;
      City:String;
      Position:String;
      HireDate:Date;
      TerminationDate:Date default '9999-12-31';
      Name     : String(100);
      Avatar   : String(255);
      Birthday : Date;
      Age      : Integer 
                
}

entity Absence {
  key ID        :Integer;
      Name:String;
      StartDate : Date;
      EndDate   : Date;
      Type      : String;
 
}