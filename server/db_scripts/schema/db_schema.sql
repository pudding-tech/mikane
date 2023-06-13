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
  [description] nvarchar(400),
  created datetime not null,
  [private] bit not null,
  active bit not null default 1,
  usernames_only bit not null,
  uuid uniqueidentifier not null default newid()
)
go

create table user_event (
  user_id int foreign key references [user](id) on delete cascade,
  event_id int foreign key references [event](id) on delete cascade,
  joined_date datetime not null,
  [admin] bit not null,
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
  [description] nvarchar(255),
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
  expires datetime not null,
  user_id int not null
)
go

create table api_key (
  api_key_id uniqueidentifier primary key default newid(),
  [name] nvarchar(255) not null unique,
  hashed_key nvarchar(255) not null,
  [master] bit not null,
  valid_from datetime,
  valid_to datetime
)
go

create table register_account_key (
  [key] nvarchar(255) primary key,
  email nvarchar(255) not null,
  used bit not null,
  expires datetime not null
)
go

create table delete_account_key (
  [key] nvarchar(255) primary key,
  user_id int foreign key references [user](id) on delete set null,
  used bit not null,
  expires datetime not null
)
go

create table password_reset_key (
  [key] nvarchar(255) primary key,
  user_id int foreign key references [user](id) on delete cascade,
  used bit not null,
  expires datetime not null
)
go
