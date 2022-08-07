exec new_event 'Pudding Week 2021' -- 1
exec new_event 'Pudding Week 2022' -- 2

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

exec new_user 'Adrian', 2 -- 14
exec new_user 'Andreas', 2 -- 15
exec new_user 'Martin', 2 -- 16
exec new_user 'Odd', 2 -- 17
exec new_user 'Svend-Peder', 2 -- 18
exec new_user 'Sondre', 2 -- 19
exec new_user 'Emilia', 2 -- 20
exec new_user 'Arisa', 2 -- 21
exec new_user 'Nikolai', 2 -- 22

exec new_category 1, 'Cabin stay', 0 -- 1
exec new_category 1, 'Food', 1 -- 2
exec new_category 1, 'Høyt og lavt (climbing)', 0 -- 3
exec new_category 1, 'Rafting', 0 -- 4
exec new_category 1, 'Paddleboard', 0 -- 5
exec new_category 1, 'Trondheim drive (Adrian''s car)', 0 -- 6
exec new_category 1, 'Personal expenses Odd (paid by Adrian)', 0 -- 7
exec new_category 1, 'Personal expenses SP (paid by Adrian)', 0 -- 8
exec new_category 1, 'Karaoke night', 0 -- 9

exec new_category 2, 'Food', 1 -- 10
exec new_category 2, 'Other', 0 -- 11
exec new_category 2, 'Alcohol', 0 -- 12
exec new_category 2, 'Gas Trondheim-Trysil', 0 -- 13
exec new_category 2, 'Hamar', 0 -- 14
exec new_category 2, 'Gas Trysil-Trondheim', 0 -- 15
exec new_category 2, 'Gas Other (Adrian)', 1 -- 16
exec new_category 2, 'Scam lamp', 0 -- 17
exec new_category 2, 'Scam lamp (SP)', 0 -- 18
exec new_category 2, 'Paddleboard', 0 -- 19
exec new_category 2, 'Disc golf', 0 -- 20

-- Pudding Week 2021
exec add_user_to_category 1, 1, null -- Cabin stay
exec add_user_to_category 1, 2, null
exec add_user_to_category 1, 3, null
exec add_user_to_category 1, 4, null
exec add_user_to_category 1, 5, null
exec add_user_to_category 1, 6, null
exec add_user_to_category 1, 7, null
exec add_user_to_category 1, 8, null
exec add_user_to_category 1, 9, null

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

exec add_user_to_category 3, 1, null -- Climbing
exec add_user_to_category 3, 4, null
exec add_user_to_category 3, 5, null
exec add_user_to_category 3, 6, null
exec add_user_to_category 3, 7, null
exec add_user_to_category 3, 8, null
exec add_user_to_category 3, 9, null

exec add_user_to_category 4, 1, null -- Rafting
exec add_user_to_category 4, 2, null
exec add_user_to_category 4, 6, null
exec add_user_to_category 4, 7, null
exec add_user_to_category 4, 8, null

exec add_user_to_category 5, 1, null -- Paddleboard
exec add_user_to_category 5, 2, null
exec add_user_to_category 5, 6, null
exec add_user_to_category 5, 10, null
exec add_user_to_category 5, 11, null
exec add_user_to_category 5, 12, null
exec add_user_to_category 5, 13, null

exec add_user_to_category 6, 2, null -- Trondheim drive
exec add_user_to_category 6, 3, null
exec add_user_to_category 6, 4, null
exec add_user_to_category 6, 5, null

exec add_user_to_category 7, 2, null -- Personal Odd

exec add_user_to_category 8, 1, null -- Personal SP

exec add_user_to_category 9, 1, null -- Karaoke
exec add_user_to_category 9, 2, null
exec add_user_to_category 9, 3, null
exec add_user_to_category 9, 4, null
exec add_user_to_category 9, 5, null
exec add_user_to_category 9, 6, null
exec add_user_to_category 9, 7, null
exec add_user_to_category 9, 8, null
exec add_user_to_category 9, 9, null
exec add_user_to_category 9, 10, null
exec add_user_to_category 9, 11, null
exec add_user_to_category 9, 12, null
exec add_user_to_category 9, 13, null

-- Pudding Week 2022
exec add_user_to_category 10, 14, 9 -- Food
exec add_user_to_category 10, 15, 9
exec add_user_to_category 10, 16, 9
exec add_user_to_category 10, 17, 9
exec add_user_to_category 10, 18, 9
exec add_user_to_category 10, 19, 9
exec add_user_to_category 10, 20, 9
exec add_user_to_category 10, 21, 3
exec add_user_to_category 10, 22, 8

exec add_user_to_category 11, 14, null -- Other
exec add_user_to_category 11, 15, null
exec add_user_to_category 11, 16, null
exec add_user_to_category 11, 17, null
exec add_user_to_category 11, 18, null
exec add_user_to_category 11, 19, null
exec add_user_to_category 11, 20, null
exec add_user_to_category 11, 21, null
exec add_user_to_category 11, 22, null

exec add_user_to_category 12, 14, null -- Alcohol
exec add_user_to_category 12, 16, null
exec add_user_to_category 12, 17, null
exec add_user_to_category 12, 18, null
exec add_user_to_category 12, 19, null
exec add_user_to_category 12, 20, null
exec add_user_to_category 12, 22, null

exec add_user_to_category 13, 14, null -- Gas Trondheim-Trysil
exec add_user_to_category 13, 15, null
exec add_user_to_category 13, 19, null

exec add_user_to_category 14, 14, null -- Hamar
exec add_user_to_category 14, 15, null
exec add_user_to_category 14, 21, null

exec add_user_to_category 15, 14, null -- Gas Trysil-Trondheim
exec add_user_to_category 15, 15, null
exec add_user_to_category 15, 19, null
exec add_user_to_category 15, 21, null

exec add_user_to_category 17, 14, null -- Scam lamp
exec add_user_to_category 17, 15, null
exec add_user_to_category 17, 16, null
exec add_user_to_category 17, 17, null
exec add_user_to_category 17, 18, null
exec add_user_to_category 17, 19, null
exec add_user_to_category 17, 20, null
exec add_user_to_category 17, 21, null
exec add_user_to_category 17, 22, null

exec add_user_to_category 18, 18, null -- Scam lamp - SP

exec add_user_to_category 19, 17, null -- Paddleboard
exec add_user_to_category 19, 18, null
exec add_user_to_category 19, 19, null
exec add_user_to_category 19, 22, null

exec add_user_to_category 20, 14, null -- Disc golf
exec add_user_to_category 20, 15, null
exec add_user_to_category 20, 16, null
exec add_user_to_category 20, 17, null
exec add_user_to_category 20, 18, null
exec add_user_to_category 20, 19, null
exec add_user_to_category 20, 20, null
exec add_user_to_category 20, 22, null

-- name, desc, amount, cat_id, payer_id
-- Pudding Week 2021
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

-- Pudding Week 2022
exec new_expense 'Handling 6. august', null, 1233.8, 10, 14
exec new_expense 'Handling 5. august', null, 339.6, 10, 14
exec new_expense 'Handling nr.2 - 5. august', null, 451.17, 10, 14
exec new_expense 'Handling 4. august', null, 71.3, 10, 14
exec new_expense 'Handling nr.2 - 4. august', null, 1564.86, 10, 14
exec new_expense 'Handling 3. august', null, 1389.87, 10, 14
exec new_expense 'Handling 2. august', null, 1945.09, 10, 14
exec new_expense 'Handling 1. august', null, 2204.49, 10, 14
exec new_expense 'Skjøteledning', null, 99, 11, 14
exec new_expense 'Handling 30. juli', null, 93.4, 10, 14
exec new_expense 'Kjøkkenutstyr', null, 98, 11, 14
exec new_expense 'Handling 30. juli', null, 3952.74, 10, 14
exec new_expense 'Handling kiwi 05.08', null, 110.4, 10, 14
exec new_expense 'Handling kiwi 04.08', null, 84.9, 10, 14
exec new_expense 'Handling kiwi 03.08', null, 294.59, 10, 14
exec new_expense 'Handling kiwi 30.07', null, 67.8, 10, 14
exec new_expense 'Vinmonopolet 3. august', null, 852.8, 12, 14
exec new_expense 'Parkering Hamar', null, 26, 14, 14
exec new_expense 'Handling Rema 02.08', null, 73.5, 10, 14
exec new_expense 'Vinmonopolet (for mat) 4. august', null, 132.9, 10, 14
exec new_expense 'Handling nr.2 - 2. august', 'Godteri og leverpostei lokk', 67.2, 10, 16
exec new_expense 'Scam lamp', null, 300, 17, 17
exec new_expense 'Scam lamp - SP keeps lamp', null, 200, 17, 17
exec new_expense 'Paddleboard', null, 800, 19, 19
exec new_expense 'Brioche brød', null, 120, 10, 19
exec new_expense 'Rom brun', null, 385, 12, 19
exec new_expense 'Disc golf', null, 400, 20, 19
