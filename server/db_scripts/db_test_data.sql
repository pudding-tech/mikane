insert into [user] (name)
  values ('Adrian'), ('Andreas'), ('Odd'), ('Martin'), ('Svend-Peder'), ('Sondre'), ('Emilia'), ('Nikolai')

insert into [event] (name)
  values ('Pudding Week 2021'), ('Pudding Week 2022'), ('Pudding Week 2023')

insert into event_user (event_id, user_id)
  values (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (2, 1), (2, 2), (2, 3), (2, 4), (2, 7), (2, 8), (3, 1), (3, 2)
