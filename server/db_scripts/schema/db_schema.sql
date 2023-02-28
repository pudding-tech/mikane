create database puddingdebt
go
use puddingdebt
go

create table [user] (
  id int identity(1,1) primary key,
  username nvarchar(255) not null unique,
  first_name nvarchar(255) not null,
  last_name nvarchar(255),
  email nvarchar(255) not null unique,
  phone_number nvarchar(20) not null unique,
  [password] nvarchar(255) not null,
  created datetime not null,
  uuid uniqueidentifier not null default newid()
)
go

create table [event] (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null unique,
  created datetime not null,
  admin_id int foreign key references [user](id) on delete set null,
  [private] bit not null,
  uuid uniqueidentifier not null default newid()
)
go

create table user_event (
  user_id int foreign key references [user](id) on delete cascade,
  event_id int foreign key references [event](id) on delete cascade,
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

create table user_category (
  user_id int foreign key references [user](id) on delete cascade,
  category_id int foreign key references category(id) on delete cascade,
  [weight] numeric(14),
  primary key (user_id, category_id)
)
go

create table [session] (
  [sid] nvarchar(255) not null primary key,
  [session] nvarchar(max) not null,
  expires datetime not null
)
go
