create database puddingdebt
go
use puddingdebt
go

create table [user] (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null,
  email nvarchar(255) not null,
  [password] nvarchar(255) not null,
  created datetime not null
)
go

create table [event] (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null unique,
  created datetime not null,
  [guid] uniqueidentifier not null default newid()
)
go

create table user_event (
  user_id int foreign key references [user](id) on delete cascade,
  event_id int foreign key references [event](id) on delete cascade,
  [admin] bit not null,
  joined_date datetime not null,
  primary key (user_id, event_id)
)
go

create table category (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null,
  weighted bit,
  event_id int foreign key references [event](id) on delete cascade
)
go

create table expense (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null,
  [description] nvarchar(255) not null,
  amount numeric(16, 2) not null,
  category_id int foreign key references category(id) on delete cascade,
  payer_id int foreign key references [user](id) on delete cascade,
  date_added datetime not null
)
go

create table category_user (
  category_id int foreign key references category(id) on delete cascade,
  user_id int foreign key references [user](id) on delete cascade,
  [weight] numeric(14),
  primary key (category_id, user_id)
)
go