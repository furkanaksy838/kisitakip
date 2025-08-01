using kisitakip.db from '../db/schema';

service PeopleService {
  entity People as projection on db.Person {
    ID,
    Name,
    Birthday,
    Age,            
    City,
    Position,
    HireDate,
    Avatar,
    TerminationDate
  };

  entity Absences as projection on db.Absence;
}