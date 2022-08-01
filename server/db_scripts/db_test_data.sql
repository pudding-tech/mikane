exec new_event 'Pudding Week 2021' -- 1
exec new_event 'Pudding Week 2022' -- 2
exec new_event 'Christmas Party' -- 3
exec new_event 'Midsummer Festival' -- 4

exec new_user 'Svend-Peder', 1 -- 1
exec new_user 'Odd', 1 -- 2
exec new_user 'Adrian', 1 -- 3
exec new_user 'Andreas', 1 -- 4
exec new_user 'Arisa', 1 -- 5
exec new_user 'Sondre', 1 -- 6
exec new_user 'Alida', 1 -- 7
exec new_user 'Martin', 1 -- 8
exec new_user 'Emilia', 1 -- 9
exec new_user 'Tord', 1 -- 10
exec new_user 'Elisabeth', 1 -- 11
exec new_user 'Andreas L', 1 -- 12
exec new_user 'Oda', 1 -- 13

exec new_user 'Svend-Peder', 2 -- 14
exec new_user 'Odd', 2 -- 15
exec new_user 'Adrian', 2 -- 16
exec new_user 'Andreas', 2 -- 17
exec new_user 'Arisa', 2 -- 18
exec new_user 'Sondre', 2 -- 19
exec new_user 'Alida', 2 -- 20
exec new_user 'Martin', 2 -- 21
exec new_user 'Nikolai', 2 -- 22

exec new_user 'Svend-Peder', 3 -- 23
exec new_user 'Odd', 3 -- 24
exec new_user 'Adrian', 3 -- 25
exec new_user 'Andreas', 3 -- 26
exec new_user 'Arisa', 3 -- 27
exec new_user 'Sondre', 3 -- 28
exec new_user 'Alida', 3 -- 29
exec new_user 'Martin', 3 -- 30

exec new_user 'Svend-Peder', 4 -- 31
exec new_user 'Odd', 4 -- 32
exec new_user 'Adrian', 4 -- 33
exec new_user 'Andreas', 4 -- 34
exec new_user 'Arisa', 4 -- 35
exec new_user 'Sondre', 4 -- 36
exec new_user 'Martin', 4 -- 37

exec new_category 1, 'Cabin stay' -- 1
exec new_category 1, 'Food' -- 2
exec new_category 1, 'Høyt og lavt (climbing)' -- 3
exec new_category 1, 'Rafting' -- 4
exec new_category 1, 'Paddleboard' -- 5
exec new_category 1, 'Trondheim drive (Adrian''s car)' -- 6
exec new_category 1, 'Personal expenses Odd (paid by Adrian)' -- 7
exec new_category 1, 'Personal expenses SP (paid by Adrian)' -- 8
exec new_category 1, 'Karaoke night' -- 9

exec new_category 2, 'Food' -- 10
exec new_category 2, 'Transport' -- 11
exec new_category 2, 'Bobsleigh riding' -- 12
exec new_category 2, 'Megavalanche bike racing' -- 13

exec new_category 3, 'Cheese eating contest' -- 14
exec new_category 3, 'Running of the bulls' -- 15

exec new_category 4, 'Food' -- 16
exec new_category 4, 'Fighter-jet flying' -- 17
exec new_category 4, 'Cage diving with sharks' -- 18
exec new_category 4, 'Tickets to Ride' -- 19

-- Pudding Week 2021
exec add_user_to_category 1, 1, 1 -- Cabin stay
exec add_user_to_category 1, 2, 1
exec add_user_to_category 1, 3, 1
exec add_user_to_category 1, 4, 1
exec add_user_to_category 1, 5, 1
exec add_user_to_category 1, 6, 1
exec add_user_to_category 1, 7, 1
exec add_user_to_category 1, 8, 1
exec add_user_to_category 1, 9, 1

exec add_user_to_category 2, 1, 9 -- Food
exec add_user_to_category 2, 2, 9
exec add_user_to_category 2, 3, 9
exec add_user_to_category 2, 4, 9
exec add_user_to_category 2, 5, 9
exec add_user_to_category 2, 6, 8
exec add_user_to_category 2, 7, 8
exec add_user_to_category 2, 8, 7
exec add_user_to_category 2, 9, 7
exec add_user_to_category 2, 10, 3
exec add_user_to_category 2, 11, 3
exec add_user_to_category 2, 12, 3
exec add_user_to_category 2, 13, 3

exec add_user_to_category 3, 1, 1 -- Climbing
exec add_user_to_category 3, 4, 1
exec add_user_to_category 3, 5, 1
exec add_user_to_category 3, 6, 1
exec add_user_to_category 3, 7, 1
exec add_user_to_category 3, 8, 1
exec add_user_to_category 3, 9, 1

exec add_user_to_category 4, 1, 1 -- Rafting
exec add_user_to_category 4, 2, 1
exec add_user_to_category 4, 6, 1
exec add_user_to_category 4, 7, 1
exec add_user_to_category 4, 8, 1

exec add_user_to_category 5, 1, 1 -- Paddleboard
exec add_user_to_category 5, 2, 1
exec add_user_to_category 5, 6, 1
exec add_user_to_category 5, 10, 1
exec add_user_to_category 5, 11, 1
exec add_user_to_category 5, 12, 1
exec add_user_to_category 5, 13, 1

exec add_user_to_category 6, 2, 1 -- Trondheim drive
exec add_user_to_category 6, 3, 1
exec add_user_to_category 6, 4, 1
exec add_user_to_category 6, 5, 1

exec add_user_to_category 7, 2, 1 -- Personal Odd

exec add_user_to_category 8, 1, 1 -- Personal SP

exec add_user_to_category 9, 1, 1 -- Karaoke
exec add_user_to_category 9, 2, 1
exec add_user_to_category 9, 3, 1
exec add_user_to_category 9, 4, 1
exec add_user_to_category 9, 5, 1
exec add_user_to_category 9, 6, 1
exec add_user_to_category 9, 7, 1
exec add_user_to_category 9, 8, 1
exec add_user_to_category 9, 9, 1
exec add_user_to_category 9, 10, 1
exec add_user_to_category 9, 11, 1
exec add_user_to_category 9, 12, 1
exec add_user_to_category 9, 13, 1

-- Pudding Week 2022
exec add_user_to_category 10, 16, 3
exec add_user_to_category 10, 17, 2
exec add_user_to_category 10, 15, 6
exec add_user_to_category 10, 21, 1

exec add_user_to_category 11, 16, 1
exec add_user_to_category 11, 15, 1
exec add_user_to_category 11, 14, 1

exec add_user_to_category 12, 17, 1
exec add_user_to_category 12, 21, 1

exec add_user_to_category 13, 14, 3
exec add_user_to_category 13, 19, 18

-- Christmas Party
exec add_user_to_category 14, 30, 1
exec add_user_to_category 14, 23, 1

exec add_user_to_category 15, 28, 3
exec add_user_to_category 15, 25, 1

-- Midsummer Festival
exec add_user_to_category 16, 33, 1
exec add_user_to_category 16, 34, 1
exec add_user_to_category 16, 32, 1

exec add_user_to_category 17, 33, 1
exec add_user_to_category 17, 34, 1
exec add_user_to_category 17, 32, 1

exec add_user_to_category 18, 31, 2
exec add_user_to_category 18, 36, 2

exec add_user_to_category 19, 33, 2
exec add_user_to_category 19, 34, 99

-- name, desc, amount, cat_id, payer_id
exec new_expense 'Food shopping, Saturday 31.07', 'Removed some personal expenses', 3140.29, 2, 3
exec new_expense 'Personal expenses, Odd 31.07', null, 87.8, 7, 3
exec new_expense 'Food shopping, Monday 02.08', 'Removed some personal expenses', 688.5, 2, 3
exec new_expense 'Personal expenses, Odd 02.08', null, 14.9, 7, 3
exec new_expense 'Kitchen equipment 02.08', null, 98, 8, 3
exec new_expense 'Food shopping, Tuesday 03.08', null, 943.83, 2, 3
exec new_expense 'Food shopping, Wednesday 04.08', 'Removed some personal expenses', 1819.31, 2, 3
exec new_expense 'Food shopping, Thursday 05.08', 'Removed some personal expenses', 1303.82, 2, 3
exec new_expense 'Food shopping, Friday 06.08', 'Removed some personal expenses', 1762.1, 2, 3
exec new_expense 'Personal expenses, Odd 06.08', null, 33.9, 7, 3
exec new_expense 'Rafting toll', null, 60, 4, 6
exec new_expense 'Paddleboard toll', null, 60, 5, 6
exec new_expense 'Climbing toll', null, 60, 3, 6
exec new_expense 'Vinmonopol 04.08', null, 465, 9, 6
exec new_expense 'Food shopping, Thursday 05.08', null, 322, 2, 6
exec new_expense 'Petrol Sondre, rafting', null, 688, 4, 6
exec new_expense 'Food shopping, Wednesday 04.08', null, 146.56, 2, 9
exec new_expense 'Food shopping, Tuesday 03.08 (Kiwi)', null, 501.67, 2, 3
exec new_expense 'Food shopping, Wednesday 04.08 (Kiwi)', null, 391.8, 2, 3
exec new_expense 'Food shopping, Sunday 01.08 (Kiwi)', 'Removed some personal expenses', 722.1, 2, 3
exec new_expense 'Personal expenses, Odd 01.08', null, 13.7, 7, 3
exec new_expense 'Food shopping, Tuesday 31.07 (Kiwi)', null, 123.3, 2, 3
exec new_expense 'Vinmonopol 30.07', null, 471.8, 9, 2
exec new_expense 'Paddleboard rent', null, 800, 5, 2
exec new_expense 'Food shopping, Tuesday 30.07', null, 875.5, 2, 1
exec new_expense 'Klatrepark', null, 2310, 3, 1
exec new_expense 'Rafting', null, 6975, 4, 1
exec new_expense 'Climbing toll', null, 60, 3, 1
exec new_expense 'Cabin rent', null, 10998, 1, 1
exec new_expense 'Food shopping Saturday 07.08', null, 723.05, 2, 3
exec new_expense 'Gas shopping', null, 381.4, 2, 3
exec new_expense 'Gas Trondheim-Trysil (round trip)', null, 1111.8, 6, 3
exec new_expense 'Toll Trondheim-Trysil (round trip)', null, 64, 6, 3

exec new_expense 'Bananer', 'De kommer i pyjamas', 54, 10, 16
exec new_expense 'Ostepop', 'Illeluktende', 12.95, 10, 15
exec new_expense 'Steam train', 'We''ve got a ticket to ride', 17999, 11, 17
exec new_expense 'Shark', null, 24000, 18, 36
exec new_expense 'Blue cheese', null, 45.75, 14, 23
exec new_expense 'Stinky sock cheese', null, 2, 14, 28
exec new_expense 'Norvegia', null, 60, 14, 26
exec new_expense 'Bobsleigh', null, 7999, 12, 17
exec new_expense 'City bike', null, 3000, 13, 19
exec new_expense 'Bull', 'The angriest one', 8400, 15, 25
exec new_expense 'Ticket', 'Choo choo!', 4800, 19, 33
exec new_expense 'Huge water tank', null, 19900, 18, 36
exec new_expense 'Cage', 'Moderately secure', 3999, 18, 36
exec new_expense 'Pringles', null, 800, 16, 33
exec new_expense 'Donkey ride', 'One last ride...', 200, 11, 17
