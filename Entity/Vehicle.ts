﻿/*********************************************************
*
*  Copyright © 2017, Raybit Games.
*
*  All Rights Reserved.
*
*  Redistribution and use in source and binary forms,
*  with or without modification,
*  is permitted only for authors.
*
*********************************************************/

import * as ORM from "typeorm";

import { Entity } from "./Entity";

@ORM.Entity( "vehicles" )
export class Vehicle extends Entity implements VehicleInterface
{
	@ORM.PrimaryGeneratedColumn()
	protected id  : number;

	@ORM.Column( "bigint" )
	protected model : VehicleModel;

	@ORM.Column( "json" )
	protected position : Vector3;

	@ORM.Column( "json" )
	protected rotation : Vector3;

	@ORM.Column( "int" )
	protected dimension : number;

	@ORM.Column( "json" )
	protected color : VehicleColor;

	@ORM.Column()
	protected plate : string;

	@ORM.Column()
	protected siren	: boolean;

	@ORM.Column()
	protected engine : boolean;

	@ORM.Column()
	protected lights : number;

	@ORM.Column( { name: "engine_health" } )
	protected engineHealth : number;

	@ORM.Column( { name: "body_health" } )
	protected bodyHealth : number;

	@ORM.Column()
	protected locked : boolean;

	@ORM.Column( { name: "neon_enabled" } )
	protected neonEnabled : boolean;

	@ORM.Column( { name: "neon_color", type: "json" } )
	protected neonColor : Color;

	@ORM.Column( { name: "mods", type: "json", nullable: true, default: null } )
	protected mods : Object;

	@ORM.Column( { name: "default_position", type: "json" } )
	protected defaultPosition : Vector3;

	@ORM.Column( { name: "default_rotation", type: "json" } )
	protected defaultRotation : Vector3;

	@ORM.Column( { name: "default_dimension", type: "int" } )
	protected defaultDimension : number;

	@ORM.CreateDateColumn( { name: "created_at" } )
	protected createdAt : Date;

	@ORM.Column( { type: "datetime", name: "deleted_at", nullable: true, default: null } )
	protected deletedAt : Date;

	protected entity : mp.Vehicle;

	constructor( entity : mp.Entity );

	constructor( model : VehicleModel, position : Vector3, rotation : Vector3, dimension : number, color : VehicleColor, plate : string );

	constructor( modelOrEntity : any, position ?: Vector3, rotation ?: Vector3, dimension ?: number, color ?: VehicleColor, plate ?: string )
	{
		if( position == null )
		{
			super( modelOrEntity );

			this.mods = {};

			return;
		}

		super( mp.vehicles.new( modelOrEntity, position, null, dimension ) );

		this.mods = {};

		this.model            = modelOrEntity;
		this.position         = position;
		this.rotation         = rotation;
		this.dimension        = dimension;
		this.color            = color;
		this.plate            = plate;
		this.defaultPosition  = position;
		this.defaultRotation  = rotation;
		this.defaultDimension = dimension;

		this.entity.rotation    = this.rotation;

		this.SetPlate( plate );
		this.SetColor( color );
	}

	public Create() : void
	{
		if( this.IsDeleted() )
		{
			return;
		}

		this.entity = mp.vehicles.new( this.model, this.position, null, this.dimension );

		this.entity.rotation    = this.rotation;

		this.SetColor           ( this.color );
		this.SetPlate           ( this.plate );
		this.SetSirensState     ( this.siren );
		this.SetEngineState     ( this.engine );
		this.SetLightsState     ( this.lights );
		this.SetEngineHealth    ( this.engineHealth );
		this.SetBodyHealth      ( this.bodyHealth );
		this.SetLocked          ( this.locked );
		this.SetNeonColor       ( this.neonColor );
		this.SetNeonEnabled     ( this.neonEnabled );
	}

	public Persist( repository : ORM.Repository< Vehicle > ) : Promise< Vehicle >
	{
		if( this.IsDeleted() )
		{
			return null;
		}

		if( this.GetID() < 0 )
		{
			return null;
		}

		this.model              = this.GetModel();
		this.position           = this.GetPosition();
		this.rotation           = this.GetRotation();
		this.dimension          = this.GetDimension();
		this.color              = this.GetColor();
		this.plate              = this.GetPlate();
		this.siren	            = this.GetSirensState();
		this.engine             = this.GetEngineState();
		this.lights             = this.GetLightsState();
		this.engineHealth       = this.GetEngineHealth();
		this.bodyHealth         = this.GetBodyHealth();
		this.locked             = this.IsLocked();
		this.neonEnabled        = this.IsNeonEnabled();
		this.neonColor          = this.GetNeonColor();

		return repository.persist( this );
	}

	public Respawn() : void
	{
		this.Fix();

		this.SetDimension       ( this.defaultDimension );
		this.SetPosition        ( this.defaultPosition );
		this.SetRotation        ( this.defaultRotation );

		this.SetModel           ( this.model );
		this.SetColor           ( this.color );
		this.SetPlate           ( this.plate );
		this.SetSirensState     ( this.siren );
		this.SetEngineState     ( this.engine );
		this.SetLightsState     ( this.lights );
		this.SetEngineHealth    ( this.engineHealth );
		this.SetBodyHealth      ( this.bodyHealth );
		this.SetLocked          ( this.locked );
		this.SetNeonColor       ( this.neonColor );
		this.SetNeonEnabled     ( this.neonEnabled );
	}

	public Delete() : void
	{
		this.deletedAt = new Date();

		this.Destroy();
	}

	public IsDeleted() : boolean
	{
		return this.deletedAt != null;
	}

	public Restore() : void
	{
		this.deletedAt = null;

		this.Create();
	}

	public GetID() : number
	{
		return this.id;
	}

	public GetName() : string
	{
		return VehicleModel[ this.entity.model ];
	}

	public GetPlate() : string
	{
		return this.entity.numberPlate;
	}

	public SetPlate( text : string ) : void
	{
		this.entity.numberPlate = this.plate = text;
	}

	public GetColor() : VehicleColor
	{
		return this.color;
	}

	public SetColor( color : VehicleColor ) : void
	{
		this.color = color;

		let color1 = this.color[ 0 ];
		let color2 = this.color[ 1 ];

		this.entity.setColourRGB( color1.Red, color1.Green, color1.Blue, color2.Red, color2.Green, color2.Blue );
	}

	public GetVelocity() : Vector3
	{
		let v = this.entity.velocity;

		return new Vector3( v.x, v.y, v.z );
	}

	public SetVelocity( velocity : Vector3 ) : void
	{
		this.entity.velocity = velocity;
	}

	public GetSirensState() : boolean
	{
		return this.entity.siren;
	}

	public SetSirensState( siren : boolean ) : void
	{
		// TODO: Readonly
		//this.entity.siren = this.siren = siren;
	}

	public GetHornState() : boolean
	{
		return this.entity.horn;
	}

	public SetHornState( horn : boolean ) : void
	{
		this.entity.horn = horn;
	}

	public GetEngineState() : boolean
	{
		return this.entity.engine;
	}

	public SetEngineState( engine : boolean ) : void
	{
		// TODO: Readonly
		//this.entity.engine = this.engine = engine;
	}

	public GetLightsState() : number
	{
		if( this.entity.highbeams )
		{
			return 2;
		}

		//return this.entity.lights ? 1 : 0;
		return 0;
	}

	public SetLightsState( lights : number ) : void
	{
		// TODO: Readonly
		//this.entity.highbeams = lights == 2;
		//this.entity.lights = lights == 1;

		this.lights = lights;

		return;
	}

	public GetEngineHealth() : number
	{
		return this.entity.engineHealth;
	}

	public SetEngineHealth( engineHealth : number ) : void
	{
		// TODO: Readonly
		//this.entity.engineHealth = this.engineHealth = engineHealth;
	}

	public GetBodyHealth() : number
	{
		return this.entity.bodyHealth;
	}

	public SetBodyHealth( bodyHealth : number ) : void
	{
		// TODO: Readonly
		//this.entity.bodyHealth = this.bodyHealth = bodyHealth;
	}

	public GetSteerAngle() : number
	{
		return this.entity.steerAngle;
	}

	public SetSteerAngle( steerAngle : number ) : void
	{
		this.entity.steerAngle = steerAngle;
	}

	public IsLocked() : boolean
	{
		return this.entity.locked;
	}

	public SetLocked( locked : boolean ) : void
	{
		this.entity.locked = this.locked = locked;
	}

	public IsNeonEnabled() : boolean
	{
		return this.entity.neonEnabled;
	}

	public SetNeonEnabled( neonEnabled : boolean ) : void
	{
		this.entity.neonEnabled = this.neonEnabled = neonEnabled;
	}

	public HaveRocketBoost() : boolean
	{
		return this.entity.rocketBoost;
	}

	public IsBraking() : boolean
	{
		return this.entity.brake;
	}

	public IsDead() : boolean
	{
		return this.entity.dead;
	}

	public Fix() : void
	{
		this.entity.repair();
	}

	public SetNeonColor( color : Color ) : void
	{
		this.neonColor = color;

		this.entity.setNeonColour( color.Red, color.Green, color.Blue );
	}

	public GetNeonColor() : Color
	{
		let color = this.entity.getNeonColour();

		return new Color( color[ 0 ], color[ 1 ], color[ 2 ] );
	}

	public SetMod( type : mp.VehicleModTypes, index : any, customTires : any ) : void
	{
		this.mods[ type ] =
		{
			Index : index,
			Tires : customTires,
		};

		return this.entity.setMod( type, index, customTires );
	}

	public GetMod( type : mp.VehicleModTypes ) : number
	{
		return this.entity.getMod( type );
	}

	public SetPaint( ...args : any[] ) : void
	{
		this.entity.setPaint( ...args );
	}

	public GetPaint() : any
	{
		return this.entity.getPaint();
	}

	public GetOccupant() : any
	{
		return this.entity.getOccupant();
	}

	public SetOccupant( ...args : any[] ) : void
	{
		this.entity.setOccupant( ...args );
	}

	public GetOccupants() : any
	{
		return this.entity.getOccupants();
	}

	public Explode( silent : boolean = false, invisible : boolean = false ) : void
	{
		this.entity.explode( !silent, invisible );
	}

	public Spawn( ...args : any[] ) : void
	{
		this.entity.spawn( ...args );
	}
}