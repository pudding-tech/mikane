exec new_event 'Pudding Week 2021'
exec new_event 'Pudding Week 2022'
exec new_event 'Pudding Week 2023'

exec new_user 'Adrian', 1
exec new_user 'Andreas', 1
exec new_user 'Odd', 1
exec new_user 'Martin', 1
exec new_user 'Svend-Peder', 1
exec new_user 'Sondre', 1
exec new_user 'Emilia', 1
exec new_user 'Nikolai', 1

insert into event_user (event_id, user_id)
  values (2, 1), (2, 2), (2, 3), (2, 4), (2, 7), (2, 8), (3, 1), (3, 2)

exec new_category 1, 'Food'
exec new_category 1, 'Transport'
exec new_category 1, 'Ski jumping'
exec new_category 2, 'Racing'
exec new_category 3, 'Food'
exec new_category 3, 'Tickets to Ride'

exec add_user_to_category 1, 1, 3
exec add_user_to_category 1, 2, 2
exec add_user_to_category 1, 3, 6
exec add_user_to_category 1, 4, 1
exec add_user_to_category 2, 3, 1
exec add_user_to_category 2, 5, 1
exec add_user_to_category 4, 1, 2
exec add_user_to_category 4, 2, 99

exec new_expense 'Bananer', 'De kommer i pyjamas', 54, 1, 1
exec new_expense 'Ostepop', 'PS: De lukter', 12.95, 1, 3
exec new_expense 'TV', '', 7999, 4, 2