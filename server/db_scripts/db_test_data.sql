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
  values (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (3, 1), (3, 2), (3, 3), (3, 5), (3, 6)

exec new_category 1, 'Food'
exec new_category 1, 'Transport'
exec new_category 1, 'Bobsleigh riding'
exec new_category 1, 'Megavalanche bike racing'
exec new_category 2, 'Cheese eating contest'
exec new_category 2, 'Running of the bulls'
exec new_category 3, 'Food'
exec new_category 3, 'Fighter-jet flying'
exec new_category 3, 'Cage diving with sharks'
exec new_category 3, 'Tickets to Ride'

exec add_user_to_category 1, 1, 3
exec add_user_to_category 1, 2, 2
exec add_user_to_category 1, 3, 6
exec add_user_to_category 1, 4, 1

exec add_user_to_category 2, 1, 1
exec add_user_to_category 2, 3, 1
exec add_user_to_category 2, 5, 1

exec add_user_to_category 3, 2, 1
exec add_user_to_category 3, 4, 1

exec add_user_to_category 4, 5, 3
exec add_user_to_category 4, 6, 18

exec add_user_to_category 5, 4, 1
exec add_user_to_category 5, 5, 1

exec add_user_to_category 6, 6, 1

exec add_user_to_category 7, 1, 1
exec add_user_to_category 7, 2, 1
exec add_user_to_category 7, 3, 1

exec add_user_to_category 8, 1, 1
exec add_user_to_category 8, 2, 1
exec add_user_to_category 8, 3, 1

exec add_user_to_category 9, 5, 2
exec add_user_to_category 9, 6, 2

exec add_user_to_category 10, 1, 2
exec add_user_to_category 10, 2, 99

exec new_expense 'Bananer', 'De kommer i pyjamas', 54, 1, 1
exec new_expense 'Ostepop', 'Illeluktende', 12.95, 1, 3
exec new_expense 'Steam train', 'We''ve got a ticket to ride', 17999, 2, 2
exec new_expense 'Shark', null, 24000, 9, 6
exec new_expense 'Blue cheese', null, 45.75, 5, 5
exec new_expense 'Stinky sock cheese', null, 2, 5, 6
exec new_expense 'Norvegia', null, 60, 5, 2
exec new_expense 'Bobsleigh', null, 7999, 5, 2
exec new_expense 'City bike', null, 3000, 4, 6
exec new_expense 'Bull', 'The angriest one', 8400, 4, 1
exec new_expense 'Ticket', 'Choo choo!', 4800, 10, 1
exec new_expense 'Huge water tank', null, 19900, 9, 6
exec new_expense 'Cage', 'Moderately secure', 3999, 9, 6
exec new_expense 'Pringles', null, 800, 7, 1
exec new_expense 'Donkey ride', 'One last ride...', 200, 2, 2