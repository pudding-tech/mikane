create table [user] (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null unique,
  created datetime
)

create table [event] (
  id int identity(1,1) primary key,
  [name] nvarchar(255)
)

create table event_user (
  event_id int foreign key references [event](id) on delete cascade,
  user_id int foreign key references [user](id) on delete cascade
  primary key (event_id, user_id)
)

create table category (
  id int identity(1,1) primary key,
  [name] nvarchar(255),
  event_id int foreign key references [event](id) on delete cascade
)

create table expense (
  id int identity(1,1) primary key,
  [name] nvarchar(255),
  [description] nvarchar(255),
  category_id int foreign key references category(id) on delete no action,
  user_id int foreign key references [user](id) on delete no action
)