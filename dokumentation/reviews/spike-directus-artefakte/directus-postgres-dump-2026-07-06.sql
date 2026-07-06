--
-- PostgreSQL database dump
--

\restrict K0F2lIGYZicdHTZSSykcVKppdqyXhwUvsAFFtCOka20Qa2Nd1dUE2RhMi19gEv2

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dialog_segmente; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.dialog_segmente (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    sort integer,
    rolle character varying(255) NOT NULL,
    quelle character varying(255),
    text text NOT NULL,
    gruppe character varying(255),
    tail character varying(255),
    station integer
);


ALTER TABLE public.dialog_segmente OWNER TO directus;

--
-- Name: dialog_segmente_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.dialog_segmente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dialog_segmente_id_seq OWNER TO directus;

--
-- Name: dialog_segmente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.dialog_segmente_id_seq OWNED BY public.dialog_segmente.id;


--
-- Name: directus_access; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_access (
    id uuid NOT NULL,
    role uuid,
    "user" uuid,
    policy uuid NOT NULL,
    sort integer
);


ALTER TABLE public.directus_access OWNER TO directus;

--
-- Name: directus_activity; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_activity (
    id integer NOT NULL,
    action character varying(45) NOT NULL,
    "user" uuid,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip character varying(50),
    user_agent text,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    origin character varying(255)
);


ALTER TABLE public.directus_activity OWNER TO directus;

--
-- Name: directus_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_activity_id_seq OWNER TO directus;

--
-- Name: directus_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_activity_id_seq OWNED BY public.directus_activity.id;


--
-- Name: directus_collections; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_collections (
    collection character varying(64) NOT NULL,
    icon character varying(64),
    note text,
    display_template character varying(255),
    hidden boolean DEFAULT false NOT NULL,
    singleton boolean DEFAULT false NOT NULL,
    translations json,
    archive_field character varying(64),
    archive_app_filter boolean DEFAULT true NOT NULL,
    archive_value character varying(255),
    unarchive_value character varying(255),
    sort_field character varying(64),
    accountability character varying(255) DEFAULT 'all'::character varying,
    color character varying(255),
    item_duplication_fields json,
    sort integer,
    "group" character varying(64),
    collapse character varying(255) DEFAULT 'open'::character varying NOT NULL,
    preview_url character varying(255),
    versioning boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_collections OWNER TO directus;

--
-- Name: directus_comments; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_comments (
    id uuid NOT NULL,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    comment text NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    user_updated uuid
);


ALTER TABLE public.directus_comments OWNER TO directus;

--
-- Name: directus_dashboards; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_dashboards (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64) DEFAULT 'dashboard'::character varying NOT NULL,
    note text,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    color character varying(255)
);


ALTER TABLE public.directus_dashboards OWNER TO directus;

--
-- Name: directus_deployment_projects; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_deployment_projects (
    id uuid NOT NULL,
    deployment uuid NOT NULL,
    external_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    url character varying(255),
    framework character varying(255),
    deployable boolean DEFAULT true NOT NULL
);


ALTER TABLE public.directus_deployment_projects OWNER TO directus;

--
-- Name: directus_deployment_runs; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_deployment_runs (
    id uuid NOT NULL,
    project uuid NOT NULL,
    external_id character varying(255) NOT NULL,
    target character varying(255) NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    status character varying(255),
    url character varying(255),
    started_at timestamp with time zone,
    completed_at timestamp with time zone
);


ALTER TABLE public.directus_deployment_runs OWNER TO directus;

--
-- Name: directus_deployments; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_deployments (
    id uuid NOT NULL,
    provider character varying(255) NOT NULL,
    credentials text,
    options text,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    webhook_ids json,
    webhook_secret character varying(255),
    last_synced_at timestamp with time zone
);


ALTER TABLE public.directus_deployments OWNER TO directus;

--
-- Name: directus_extensions; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_extensions (
    enabled boolean DEFAULT true NOT NULL,
    id uuid NOT NULL,
    folder character varying(255) NOT NULL,
    source character varying(255) NOT NULL,
    bundle uuid
);


ALTER TABLE public.directus_extensions OWNER TO directus;

--
-- Name: directus_fields; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_fields (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    field character varying(64) NOT NULL,
    special character varying(64),
    interface character varying(64),
    options json,
    display character varying(64),
    display_options json,
    readonly boolean DEFAULT false NOT NULL,
    hidden boolean DEFAULT false NOT NULL,
    sort integer,
    width character varying(30) DEFAULT 'full'::character varying,
    translations json,
    note text,
    conditions json,
    required boolean DEFAULT false,
    "group" character varying(64),
    validation json,
    validation_message text,
    searchable boolean DEFAULT true NOT NULL
);


ALTER TABLE public.directus_fields OWNER TO directus;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_fields_id_seq OWNER TO directus;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_fields_id_seq OWNED BY public.directus_fields.id;


--
-- Name: directus_files; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_files (
    id uuid NOT NULL,
    storage character varying(255) NOT NULL,
    filename_disk character varying(255),
    filename_download character varying(255) NOT NULL,
    title character varying(255),
    type character varying(255),
    folder uuid,
    uploaded_by uuid,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by uuid,
    modified_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    charset character varying(50),
    filesize bigint,
    width integer,
    height integer,
    duration integer,
    embed character varying(200),
    description text,
    location text,
    tags text,
    metadata json,
    focal_point_x integer,
    focal_point_y integer,
    tus_id character varying(64),
    tus_data json,
    uploaded_on timestamp with time zone
);


ALTER TABLE public.directus_files OWNER TO directus;

--
-- Name: directus_flows; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_flows (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64),
    color character varying(255),
    description text,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    trigger character varying(255),
    accountability character varying(255) DEFAULT 'all'::character varying,
    options json,
    operation uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_flows OWNER TO directus;

--
-- Name: directus_folders; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_folders (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    parent uuid
);


ALTER TABLE public.directus_folders OWNER TO directus;

--
-- Name: directus_migrations; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_migrations (
    version character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.directus_migrations OWNER TO directus;

--
-- Name: directus_notifications; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_notifications (
    id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255) DEFAULT 'inbox'::character varying,
    recipient uuid NOT NULL,
    sender uuid,
    subject character varying(255) NOT NULL,
    message text,
    collection character varying(64),
    item character varying(255)
);


ALTER TABLE public.directus_notifications OWNER TO directus;

--
-- Name: directus_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_notifications_id_seq OWNER TO directus;

--
-- Name: directus_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_notifications_id_seq OWNED BY public.directus_notifications.id;


--
-- Name: directus_operations; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_operations (
    id uuid NOT NULL,
    name character varying(255),
    key character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    options json,
    resolve uuid,
    reject uuid,
    flow uuid NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_operations OWNER TO directus;

--
-- Name: directus_panels; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_panels (
    id uuid NOT NULL,
    dashboard uuid NOT NULL,
    name character varying(255),
    icon character varying(64) DEFAULT NULL::character varying,
    color character varying(10),
    show_header boolean DEFAULT false NOT NULL,
    note text,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    options json,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_panels OWNER TO directus;

--
-- Name: directus_permissions; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_permissions (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    action character varying(10) NOT NULL,
    permissions json,
    validation json,
    presets json,
    fields text,
    policy uuid NOT NULL
);


ALTER TABLE public.directus_permissions OWNER TO directus;

--
-- Name: directus_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_permissions_id_seq OWNER TO directus;

--
-- Name: directus_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_permissions_id_seq OWNED BY public.directus_permissions.id;


--
-- Name: directus_policies; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_policies (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(64) DEFAULT 'badge'::character varying NOT NULL,
    description text,
    ip_access text,
    enforce_tfa boolean DEFAULT false NOT NULL,
    admin_access boolean DEFAULT false NOT NULL,
    app_access boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_policies OWNER TO directus;

--
-- Name: directus_presets; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_presets (
    id integer NOT NULL,
    bookmark character varying(255),
    "user" uuid,
    role uuid,
    collection character varying(64),
    search character varying(100),
    layout character varying(100) DEFAULT 'tabular'::character varying,
    layout_query json,
    layout_options json,
    refresh_interval integer,
    filter json,
    icon character varying(64) DEFAULT 'bookmark'::character varying,
    color character varying(255)
);


ALTER TABLE public.directus_presets OWNER TO directus;

--
-- Name: directus_presets_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_presets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_presets_id_seq OWNER TO directus;

--
-- Name: directus_presets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_presets_id_seq OWNED BY public.directus_presets.id;


--
-- Name: directus_relations; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_relations (
    id integer NOT NULL,
    many_collection character varying(64) NOT NULL,
    many_field character varying(64) NOT NULL,
    one_collection character varying(64),
    one_field character varying(64),
    one_collection_field character varying(64),
    one_allowed_collections text,
    junction_field character varying(64),
    sort_field character varying(64),
    one_deselect_action character varying(255) DEFAULT 'nullify'::character varying NOT NULL
);


ALTER TABLE public.directus_relations OWNER TO directus;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_relations_id_seq OWNER TO directus;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_relations_id_seq OWNED BY public.directus_relations.id;


--
-- Name: directus_revisions; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_revisions (
    id integer NOT NULL,
    activity integer NOT NULL,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    data json,
    delta json,
    parent integer,
    version uuid
);


ALTER TABLE public.directus_revisions OWNER TO directus;

--
-- Name: directus_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_revisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_revisions_id_seq OWNER TO directus;

--
-- Name: directus_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_revisions_id_seq OWNED BY public.directus_revisions.id;


--
-- Name: directus_roles; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_roles (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(64) DEFAULT 'supervised_user_circle'::character varying NOT NULL,
    description text,
    parent uuid
);


ALTER TABLE public.directus_roles OWNER TO directus;

--
-- Name: directus_sessions; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_sessions (
    token character varying(64) NOT NULL,
    "user" uuid,
    expires timestamp with time zone NOT NULL,
    ip character varying(255),
    user_agent text,
    share uuid,
    origin character varying(255),
    next_token character varying(64)
);


ALTER TABLE public.directus_sessions OWNER TO directus;

--
-- Name: directus_settings; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_settings (
    id integer NOT NULL,
    project_name character varying(100) DEFAULT 'Directus'::character varying NOT NULL,
    project_url character varying(255),
    project_color character varying(255) DEFAULT '#6644FF'::character varying NOT NULL,
    project_logo uuid,
    public_foreground uuid,
    public_background uuid,
    public_note text,
    auth_login_attempts integer DEFAULT 25,
    auth_password_policy character varying(100),
    storage_asset_transform character varying(7) DEFAULT 'all'::character varying,
    storage_asset_presets json,
    custom_css text,
    storage_default_folder uuid,
    basemaps json,
    mapbox_key character varying(255),
    module_bar json,
    project_descriptor character varying(100),
    default_language character varying(255) DEFAULT 'en-US'::character varying NOT NULL,
    custom_aspect_ratios json,
    public_favicon uuid,
    default_appearance character varying(255) DEFAULT 'auto'::character varying NOT NULL,
    default_theme_light character varying(255),
    theme_light_overrides json,
    default_theme_dark character varying(255),
    theme_dark_overrides json,
    report_error_url character varying(255),
    report_bug_url character varying(255),
    report_feature_url character varying(255),
    public_registration boolean DEFAULT false NOT NULL,
    public_registration_verify_email boolean DEFAULT true NOT NULL,
    public_registration_role uuid,
    public_registration_email_filter json,
    visual_editor_urls json,
    project_id uuid,
    mcp_enabled boolean DEFAULT false NOT NULL,
    mcp_allow_deletes boolean DEFAULT false NOT NULL,
    mcp_prompts_collection character varying(255) DEFAULT NULL::character varying,
    mcp_system_prompt_enabled boolean DEFAULT true NOT NULL,
    mcp_system_prompt text,
    project_owner character varying(255),
    project_usage character varying(255),
    org_name character varying(255),
    product_updates boolean,
    project_status character varying(255),
    ai_openai_api_key text,
    ai_anthropic_api_key text,
    ai_system_prompt text,
    ai_google_api_key text,
    ai_openai_compatible_api_key text,
    ai_openai_compatible_base_url text,
    ai_openai_compatible_name text,
    ai_openai_compatible_models json,
    ai_openai_compatible_headers json,
    ai_openai_allowed_models json,
    ai_anthropic_allowed_models json,
    ai_google_allowed_models json,
    collaborative_editing_enabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_settings OWNER TO directus;

--
-- Name: directus_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.directus_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_settings_id_seq OWNER TO directus;

--
-- Name: directus_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.directus_settings_id_seq OWNED BY public.directus_settings.id;


--
-- Name: directus_shares; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_shares (
    id uuid NOT NULL,
    name character varying(255),
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    role uuid,
    password character varying(255),
    user_created uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_start timestamp with time zone,
    date_end timestamp with time zone,
    times_used integer DEFAULT 0,
    max_uses integer
);


ALTER TABLE public.directus_shares OWNER TO directus;

--
-- Name: directus_translations; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_translations (
    id uuid NOT NULL,
    language character varying(255) NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.directus_translations OWNER TO directus;

--
-- Name: directus_users; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_users (
    id uuid NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(128),
    password character varying(255),
    location character varying(255),
    title character varying(50),
    description text,
    tags json,
    avatar uuid,
    language character varying(255) DEFAULT NULL::character varying,
    tfa_secret character varying(255),
    status character varying(16) DEFAULT 'active'::character varying NOT NULL,
    role uuid,
    token character varying(255),
    last_access timestamp with time zone,
    last_page character varying(255),
    provider character varying(128) DEFAULT 'default'::character varying NOT NULL,
    external_identifier character varying(255),
    auth_data json,
    email_notifications boolean DEFAULT true,
    appearance character varying(255),
    theme_dark character varying(255),
    theme_light character varying(255),
    theme_light_overrides json,
    theme_dark_overrides json,
    text_direction character varying(255) DEFAULT 'auto'::character varying NOT NULL
);


ALTER TABLE public.directus_users OWNER TO directus;

--
-- Name: directus_versions; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.directus_versions (
    id uuid NOT NULL,
    key character varying(64) NOT NULL,
    name character varying(255),
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    hash character varying(255),
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    user_updated uuid,
    delta json
);


ALTER TABLE public.directus_versions OWNER TO directus;

--
-- Name: hotspots360; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.hotspots360 (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    label character varying(255),
    action character varying(255),
    "mediumId" character varying(255),
    mascot character varying(255),
    "mascotSize" real,
    "mascotFlipX" boolean DEFAULT false,
    "bubblePitchOffset" real,
    icon character varying(255),
    "iconSize" real,
    yaw real NOT NULL,
    pitch real NOT NULL,
    station integer
);


ALTER TABLE public.hotspots360 OWNER TO directus;

--
-- Name: hotspots360_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.hotspots360_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotspots360_id_seq OWNER TO directus;

--
-- Name: hotspots360_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.hotspots360_id_seq OWNED BY public.hotspots360.id;


--
-- Name: medien; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.medien (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    typ character varying(255) NOT NULL,
    quelle character varying(255),
    "videoSource" character varying(255),
    poster character varying(255),
    thumbnail character varying(255),
    "openIn" character varying(255),
    "embedAllow" json,
    untertitel character varying(255),
    station integer
);


ALTER TABLE public.medien OWNER TO directus;

--
-- Name: medien_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.medien_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medien_id_seq OWNER TO directus;

--
-- Name: medien_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.medien_id_seq OWNED BY public.medien.id;


--
-- Name: stations; Type: TABLE; Schema: public; Owner: directus
--

CREATE TABLE public.stations (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    titel character varying(255) NOT NULL,
    beschreibung text NOT NULL,
    viewer character varying(255),
    bild character varying(255),
    panorama360 character varying(255),
    "startYaw" real,
    "startPitch" real,
    "startPanX" real,
    dialog_figuren json
);


ALTER TABLE public.stations OWNER TO directus;

--
-- Name: stations_id_seq; Type: SEQUENCE; Schema: public; Owner: directus
--

CREATE SEQUENCE public.stations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stations_id_seq OWNER TO directus;

--
-- Name: stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: directus
--

ALTER SEQUENCE public.stations_id_seq OWNED BY public.stations.id;


--
-- Name: dialog_segmente id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.dialog_segmente ALTER COLUMN id SET DEFAULT nextval('public.dialog_segmente_id_seq'::regclass);


--
-- Name: directus_activity id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_activity ALTER COLUMN id SET DEFAULT nextval('public.directus_activity_id_seq'::regclass);


--
-- Name: directus_fields id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_fields ALTER COLUMN id SET DEFAULT nextval('public.directus_fields_id_seq'::regclass);


--
-- Name: directus_notifications id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_notifications ALTER COLUMN id SET DEFAULT nextval('public.directus_notifications_id_seq'::regclass);


--
-- Name: directus_permissions id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_permissions ALTER COLUMN id SET DEFAULT nextval('public.directus_permissions_id_seq'::regclass);


--
-- Name: directus_presets id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_presets ALTER COLUMN id SET DEFAULT nextval('public.directus_presets_id_seq'::regclass);


--
-- Name: directus_relations id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_relations ALTER COLUMN id SET DEFAULT nextval('public.directus_relations_id_seq'::regclass);


--
-- Name: directus_revisions id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_revisions ALTER COLUMN id SET DEFAULT nextval('public.directus_revisions_id_seq'::regclass);


--
-- Name: directus_settings id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings ALTER COLUMN id SET DEFAULT nextval('public.directus_settings_id_seq'::regclass);


--
-- Name: hotspots360 id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.hotspots360 ALTER COLUMN id SET DEFAULT nextval('public.hotspots360_id_seq'::regclass);


--
-- Name: medien id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.medien ALTER COLUMN id SET DEFAULT nextval('public.medien_id_seq'::regclass);


--
-- Name: stations id; Type: DEFAULT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.stations ALTER COLUMN id SET DEFAULT nextval('public.stations_id_seq'::regclass);


--
-- Data for Name: dialog_segmente; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.dialog_segmente (id, key, sort, rolle, quelle, text, gruppe, tail, station) FROM stdin;
1	k1	1	frieda	\N	Hallo! Schön, dass du bei uns im Klassenzimmer vorbeischaust.	\N	\N	1
2	k2	2	otto	\N	Hier sitzen wir jeden Tag zusammen und lernen Lesen, Schreiben und Rechnen.	\N	\N	1
3	k3	3	frieda	\N	An der Tafel zeigt unsere Lehrerin neue Aufgaben, und an der Pinnwand hängen unsere schönsten Bilder.	\N	\N	1
4	k4	4	otto	\N	Schau dich ruhig um — an den Hotspots gibt es Fotos, ein Video und sogar Töne aus unserem Klassenzimmer zu entdecken.	\N	\N	1
\.


--
-- Data for Name: directus_access; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_access (id, role, "user", policy, sort) FROM stdin;
6f102b59-1eb7-4186-9857-4ef3acdc5437	\N	\N	abf8a154-5b1c-4a46-ac9c-7300570f4f17	1
6dea3fc0-af01-4413-a3f0-3148cdf45fe3	d28898ab-fa87-46be-813e-60911579474f	\N	7dd74b73-5e67-4949-b838-00ac07524324	\N
\.


--
-- Data for Name: directus_activity; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_activity (id, action, "user", "timestamp", ip, user_agent, collection, item, origin) FROM stdin;
1	login	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:06:09.016+00	178.26.66.91	curl/8.7.1	directus_users	5103b020-9ed3-416e-8503-6af468af1ce6	\N
2	login	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:10:32.12+00	178.26.66.91	curl/8.7.1	directus_users	5103b020-9ed3-416e-8503-6af468af1ce6	\N
3	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.77+00	178.26.66.91	Python-urllib/3.9	directus_fields	1	\N
4	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.775+00	178.26.66.91	Python-urllib/3.9	directus_fields	2	\N
5	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.778+00	178.26.66.91	Python-urllib/3.9	directus_fields	3	\N
6	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.78+00	178.26.66.91	Python-urllib/3.9	directus_fields	4	\N
7	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.783+00	178.26.66.91	Python-urllib/3.9	directus_fields	5	\N
8	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.785+00	178.26.66.91	Python-urllib/3.9	directus_fields	6	\N
9	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.787+00	178.26.66.91	Python-urllib/3.9	directus_fields	7	\N
10	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.789+00	178.26.66.91	Python-urllib/3.9	directus_fields	8	\N
11	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.791+00	178.26.66.91	Python-urllib/3.9	directus_fields	9	\N
12	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.794+00	178.26.66.91	Python-urllib/3.9	directus_fields	10	\N
13	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.796+00	178.26.66.91	Python-urllib/3.9	directus_fields	11	\N
14	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:03.799+00	178.26.66.91	Python-urllib/3.9	directus_collections	stations	\N
15	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.067+00	178.26.66.91	Python-urllib/3.9	directus_fields	12	\N
16	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.07+00	178.26.66.91	Python-urllib/3.9	directus_fields	13	\N
17	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.073+00	178.26.66.91	Python-urllib/3.9	directus_fields	14	\N
18	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.077+00	178.26.66.91	Python-urllib/3.9	directus_fields	15	\N
19	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.08+00	178.26.66.91	Python-urllib/3.9	directus_fields	16	\N
20	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.083+00	178.26.66.91	Python-urllib/3.9	directus_fields	17	\N
21	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.085+00	178.26.66.91	Python-urllib/3.9	directus_fields	18	\N
22	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.087+00	178.26.66.91	Python-urllib/3.9	directus_fields	19	\N
23	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.089+00	178.26.66.91	Python-urllib/3.9	directus_fields	20	\N
24	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.09+00	178.26.66.91	Python-urllib/3.9	directus_fields	21	\N
25	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.092+00	178.26.66.91	Python-urllib/3.9	directus_fields	22	\N
26	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.094+00	178.26.66.91	Python-urllib/3.9	directus_collections	medien	\N
27	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.281+00	178.26.66.91	Python-urllib/3.9	directus_fields	23	\N
28	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.284+00	178.26.66.91	Python-urllib/3.9	directus_fields	24	\N
29	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.286+00	178.26.66.91	Python-urllib/3.9	directus_fields	25	\N
30	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.288+00	178.26.66.91	Python-urllib/3.9	directus_fields	26	\N
31	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.29+00	178.26.66.91	Python-urllib/3.9	directus_fields	27	\N
32	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.292+00	178.26.66.91	Python-urllib/3.9	directus_fields	28	\N
33	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.294+00	178.26.66.91	Python-urllib/3.9	directus_fields	29	\N
34	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.296+00	178.26.66.91	Python-urllib/3.9	directus_fields	30	\N
35	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.298+00	178.26.66.91	Python-urllib/3.9	directus_fields	31	\N
36	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.3+00	178.26.66.91	Python-urllib/3.9	directus_fields	32	\N
37	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.302+00	178.26.66.91	Python-urllib/3.9	directus_fields	33	\N
38	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.303+00	178.26.66.91	Python-urllib/3.9	directus_fields	34	\N
39	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.305+00	178.26.66.91	Python-urllib/3.9	directus_fields	35	\N
40	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.307+00	178.26.66.91	Python-urllib/3.9	directus_fields	36	\N
41	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.308+00	178.26.66.91	Python-urllib/3.9	directus_collections	hotspots360	\N
42	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.686+00	178.26.66.91	Python-urllib/3.9	directus_fields	37	\N
43	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.688+00	178.26.66.91	Python-urllib/3.9	directus_fields	38	\N
44	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.69+00	178.26.66.91	Python-urllib/3.9	directus_fields	39	\N
45	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.692+00	178.26.66.91	Python-urllib/3.9	directus_fields	40	\N
46	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.694+00	178.26.66.91	Python-urllib/3.9	directus_fields	41	\N
47	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.696+00	178.26.66.91	Python-urllib/3.9	directus_fields	42	\N
48	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.698+00	178.26.66.91	Python-urllib/3.9	directus_fields	43	\N
49	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.699+00	178.26.66.91	Python-urllib/3.9	directus_fields	44	\N
50	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.701+00	178.26.66.91	Python-urllib/3.9	directus_fields	45	\N
51	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:04.703+00	178.26.66.91	Python-urllib/3.9	directus_collections	dialog_segmente	\N
52	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:35.146+00	178.26.66.91	Python-urllib/3.9	stations	1	\N
53	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:35.312+00	178.26.66.91	Python-urllib/3.9	medien	1	\N
54	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:35.554+00	178.26.66.91	Python-urllib/3.9	medien	2	\N
55	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:35.692+00	178.26.66.91	Python-urllib/3.9	medien	3	\N
56	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:35.85+00	178.26.66.91	Python-urllib/3.9	medien	4	\N
57	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:36.066+00	178.26.66.91	Python-urllib/3.9	hotspots360	1	\N
58	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:36.212+00	178.26.66.91	Python-urllib/3.9	hotspots360	2	\N
59	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:36.351+00	178.26.66.91	Python-urllib/3.9	hotspots360	3	\N
60	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:36.558+00	178.26.66.91	Python-urllib/3.9	hotspots360	4	\N
61	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:36.705+00	178.26.66.91	Python-urllib/3.9	hotspots360	5	\N
62	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:36.855+00	178.26.66.91	Python-urllib/3.9	hotspots360	6	\N
63	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:37.078+00	178.26.66.91	Python-urllib/3.9	dialog_segmente	1	\N
64	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:37.239+00	178.26.66.91	Python-urllib/3.9	dialog_segmente	2	\N
65	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:37.379+00	178.26.66.91	Python-urllib/3.9	dialog_segmente	3	\N
66	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:11:37.612+00	178.26.66.91	Python-urllib/3.9	dialog_segmente	4	\N
67	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:12:27.633+00	178.26.66.91	curl/8.7.1	directus_fields	46	\N
68	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:12:27.832+00	178.26.66.91	curl/8.7.1	directus_fields	47	\N
69	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:12:27.998+00	178.26.66.91	curl/8.7.1	directus_fields	48	\N
70	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:12:42.129+00	178.26.66.91	curl/8.7.1	directus_users	5103b020-9ed3-416e-8503-6af468af1ce6	\N
71	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:18:55.644+00	178.26.66.91	curl/8.7.1	stations	1	\N
72	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:20:04.691+00	178.26.66.91	curl/8.7.1	stations	1	\N
73	login	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:32:40.797+00	178.26.66.91	curl/8.7.1	directus_users	5103b020-9ed3-416e-8503-6af468af1ce6	\N
74	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:32:41.383+00	178.26.66.91	curl/8.7.1	stations	1	\N
75	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:36:57.015+00	178.26.66.91	curl/8.7.1	stations	1	\N
76	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:37:06.483+00	178.26.66.91	curl/8.7.1	stations	1	\N
77	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:38:51.001+00	178.26.66.91	curl/8.7.1	stations	1	\N
78	update	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:39:28.036+00	178.26.66.91	curl/8.7.1	stations	1	\N
79	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:43:09.529+00	178.26.66.91	curl/8.7.1	directus_files	f324cbe9-4c56-44ca-92ac-891caa81ebf8	\N
80	create	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:43:57.365+00	178.26.66.91	curl/8.7.1	directus_permissions	1	\N
81	delete	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:44:06.971+00	178.26.66.91	curl/8.7.1	directus_permissions	1	\N
82	delete	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:44:07.255+00	178.26.66.91	curl/8.7.1	directus_files	f324cbe9-4c56-44ca-92ac-891caa81ebf8	\N
83	login	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-06 22:48:29.375+00	178.26.66.91	curl/8.7.1	directus_users	5103b020-9ed3-416e-8503-6af468af1ce6	\N
\.


--
-- Data for Name: directus_collections; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_collections (collection, icon, note, display_template, hidden, singleton, translations, archive_field, archive_app_filter, archive_value, unarchive_value, sort_field, accountability, color, item_duplication_fields, sort, "group", collapse, preview_url, versioning) FROM stdin;
stations	\N	Spike #251 - eine Station (klassenzimmer)	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
medien	\N	Spike #251 - O2M von stations	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
hotspots360	\N	Spike #251 - O2M von stations	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
dialog_segmente	\N	Spike #251 - O2M von stations	\N	f	f	\N	\N	t	\N	\N	\N	all	\N	\N	\N	\N	open	\N	f
\.


--
-- Data for Name: directus_comments; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_comments (id, collection, item, comment, date_created, date_updated, user_created, user_updated) FROM stdin;
\.


--
-- Data for Name: directus_dashboards; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_dashboards (id, name, icon, note, date_created, user_created, color) FROM stdin;
\.


--
-- Data for Name: directus_deployment_projects; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_deployment_projects (id, deployment, external_id, name, date_created, user_created, url, framework, deployable) FROM stdin;
\.


--
-- Data for Name: directus_deployment_runs; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_deployment_runs (id, project, external_id, target, date_created, user_created, status, url, started_at, completed_at) FROM stdin;
\.


--
-- Data for Name: directus_deployments; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_deployments (id, provider, credentials, options, date_created, user_created, webhook_ids, webhook_secret, last_synced_at) FROM stdin;
\.


--
-- Data for Name: directus_extensions; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_extensions (enabled, id, folder, source, bundle) FROM stdin;
\.


--
-- Data for Name: directus_fields; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_fields (id, collection, field, special, interface, options, display, display_options, readonly, hidden, sort, width, translations, note, conditions, required, "group", validation, validation_message, searchable) FROM stdin;
1	stations	id	\N	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
2	stations	slug	\N	input	\N	\N	\N	f	f	2	full	\N	kanonischer Slug, QR-fixiert (verzeichnisstruktur.md)	\N	f	\N	\N	\N	t
3	stations	titel	\N	input	\N	\N	\N	f	f	3	full	\N	\N	\N	f	\N	\N	\N	t
4	stations	beschreibung	\N	input-multiline	\N	\N	\N	f	f	4	full	\N	\N	\N	f	\N	\N	\N	t
5	stations	viewer	\N	select-dropdown	{"choices":[{"text":"flat","value":"flat"},{"text":"equirectangular","value":"equirectangular"}]}	\N	\N	f	f	5	full	\N	\N	\N	f	\N	\N	\N	t
6	stations	bild	\N	input	\N	\N	\N	f	f	6	full	\N	Pfad unter public/ (Flat-Panorama)	\N	f	\N	\N	\N	t
7	stations	panorama360	\N	input	\N	\N	\N	f	f	7	full	\N	Pfad unter public/ (equirectangular 2:1)	\N	f	\N	\N	\N	t
8	stations	startYaw	\N	input	\N	\N	\N	f	f	8	full	\N	\N	\N	f	\N	\N	\N	t
9	stations	startPitch	\N	input	\N	\N	\N	f	f	9	full	\N	\N	\N	f	\N	\N	\N	t
10	stations	startPanX	\N	input	\N	\N	\N	f	f	10	full	\N	\N	\N	f	\N	\N	\N	t
11	stations	dialog_figuren	cast-json	tags	\N	\N	\N	f	f	11	full	\N	z.B. ["frieda","otto"] - Directus hat keinen nativen String-Enum-Array-Typ ohne M2M; JSON-Feld als pragmatischer Spike-Kompromiss (Editor-UX-Befund)	\N	f	\N	\N	\N	t
12	medien	id	\N	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
13	medien	key	\N	input	\N	\N	\N	f	f	2	full	\N	semantische ID = medium.id aus JSON; Directus-PK bleibt intern (F4)	\N	f	\N	\N	\N	t
14	medien	typ	\N	select-dropdown	{"choices":[{"text":"audio","value":"audio"},{"text":"video","value":"video"},{"text":"foto","value":"foto"},{"text":"text","value":"text"},{"text":"link","value":"link"},{"text":"embed","value":"embed"}]}	\N	\N	f	f	3	full	\N	\N	\N	f	\N	\N	\N	t
15	medien	quelle	\N	input	\N	\N	\N	f	f	4	full	\N	\N	\N	f	\N	\N	\N	t
16	medien	videoSource	\N	select-dropdown	{"choices":[{"text":"upload","value":"upload"},{"text":"youtube","value":"youtube"}]}	\N	\N	f	f	5	full	\N	\N	\N	f	\N	\N	\N	t
17	medien	poster	\N	input	\N	\N	\N	f	f	6	full	\N	\N	\N	f	\N	\N	\N	t
18	medien	thumbnail	\N	input	\N	\N	\N	f	f	7	full	\N	\N	\N	f	\N	\N	\N	t
19	medien	openIn	\N	select-dropdown	{"choices":[{"text":"external","value":"external"}]}	\N	\N	f	f	8	full	\N	\N	\N	f	\N	\N	\N	t
20	medien	embedAllow	cast-json	tags	\N	\N	\N	f	f	9	full	\N	\N	\N	f	\N	\N	\N	t
21	medien	untertitel	\N	input	\N	\N	\N	f	f	10	full	\N	\N	\N	f	\N	\N	\N	t
22	medien	station	\N	select-dropdown-m2o	\N	\N	\N	f	t	11	full	\N	\N	\N	f	\N	\N	\N	t
23	hotspots360	id	\N	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
24	hotspots360	key	\N	input	\N	\N	\N	f	f	2	full	\N	semantische ID = hotspot.id aus JSON	\N	f	\N	\N	\N	t
25	hotspots360	label	\N	input	\N	\N	\N	f	f	3	full	\N	\N	\N	f	\N	\N	\N	t
26	hotspots360	action	\N	select-dropdown	{"choices":[{"text":"medium","value":"medium"},{"text":"dialog","value":"dialog"}]}	\N	\N	f	f	4	full	\N	Default medium	\N	f	\N	\N	\N	t
27	hotspots360	mediumId	\N	input	\N	\N	\N	f	f	5	full	\N	verweist auf medien.key (kein hartes FK im Spike - Modellierungsfrage fuer #256)	\N	f	\N	\N	\N	t
28	hotspots360	mascot	\N	select-dropdown	{"choices":[{"text":"frieda","value":"frieda"},{"text":"otto","value":"otto"}]}	\N	\N	f	f	6	full	\N	\N	\N	f	\N	\N	\N	t
29	hotspots360	mascotSize	\N	input	\N	\N	\N	f	f	7	full	\N	\N	\N	f	\N	\N	\N	t
30	hotspots360	mascotFlipX	\N	boolean	\N	\N	\N	f	f	8	full	\N	\N	\N	f	\N	\N	\N	t
31	hotspots360	bubblePitchOffset	\N	input	\N	\N	\N	f	f	9	full	\N	\N	\N	f	\N	\N	\N	t
32	hotspots360	icon	\N	input	\N	\N	\N	f	f	10	full	\N	\N	\N	f	\N	\N	\N	t
33	hotspots360	iconSize	\N	input	\N	\N	\N	f	f	11	full	\N	\N	\N	f	\N	\N	\N	t
34	hotspots360	yaw	\N	input	\N	\N	\N	f	f	12	full	\N	\N	\N	f	\N	\N	\N	t
35	hotspots360	pitch	\N	input	\N	\N	\N	f	f	13	full	\N	\N	\N	f	\N	\N	\N	t
36	hotspots360	station	\N	select-dropdown-m2o	\N	\N	\N	f	t	14	full	\N	\N	\N	f	\N	\N	\N	t
37	dialog_segmente	id	\N	input	\N	\N	\N	t	t	1	full	\N	\N	\N	f	\N	\N	\N	t
38	dialog_segmente	key	\N	input	\N	\N	\N	f	f	2	full	\N	semantische ID = segment.id aus JSON	\N	f	\N	\N	\N	t
39	dialog_segmente	sort	\N	input	\N	\N	\N	f	f	3	full	\N	Segment-Reihenfolge (JSON-Array-Position, Directus hat keine native Array-Ordnung ausserhalb von M2M/O2M sort)	\N	f	\N	\N	\N	t
40	dialog_segmente	rolle	\N	select-dropdown	{"choices":[{"text":"frieda","value":"frieda"},{"text":"otto","value":"otto"},{"text":"beide","value":"beide"}]}	\N	\N	f	f	4	full	\N	\N	\N	f	\N	\N	\N	t
41	dialog_segmente	quelle	\N	input	\N	\N	\N	f	f	5	full	\N	fehlt = text-only Segment (ADR-026)	\N	f	\N	\N	\N	t
42	dialog_segmente	text	\N	input-multiline	\N	\N	\N	f	f	6	full	\N	\N	\N	f	\N	\N	\N	t
43	dialog_segmente	gruppe	\N	input	\N	\N	\N	f	f	7	full	\N	\N	\N	f	\N	\N	\N	t
44	dialog_segmente	tail	\N	select-dropdown	{"choices":[{"text":"left","value":"left"},{"text":"right","value":"right"},{"text":"center","value":"center"}]}	\N	\N	f	f	8	full	\N	\N	\N	f	\N	\N	\N	t
45	dialog_segmente	station	\N	select-dropdown-m2o	\N	\N	\N	f	t	9	full	\N	\N	\N	f	\N	\N	\N	t
46	stations	medien	o2m	list-o2m	\N	\N	\N	f	f	12	full	\N	\N	\N	f	\N	\N	\N	t
47	stations	hotspots360	o2m	list-o2m	\N	\N	\N	f	f	13	full	\N	\N	\N	f	\N	\N	\N	t
48	stations	dialog_segmente	o2m	list-o2m	\N	\N	\N	f	f	14	full	\N	\N	\N	f	\N	\N	\N	t
\.


--
-- Data for Name: directus_files; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_files (id, storage, filename_disk, filename_download, title, type, folder, uploaded_by, created_on, modified_by, modified_on, charset, filesize, width, height, duration, embed, description, location, tags, metadata, focal_point_x, focal_point_y, tus_id, tus_data, uploaded_on) FROM stdin;
\.


--
-- Data for Name: directus_flows; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_flows (id, name, icon, color, description, status, trigger, accountability, options, operation, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_folders; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_folders (id, name, parent) FROM stdin;
\.


--
-- Data for Name: directus_migrations; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_migrations (version, name, "timestamp") FROM stdin;
20201028A	Remove Collection Foreign Keys	2026-07-06 22:05:20.790435+00
20201029A	Remove System Relations	2026-07-06 22:05:20.795541+00
20201029B	Remove System Collections	2026-07-06 22:05:20.801309+00
20201029C	Remove System Fields	2026-07-06 22:05:20.807791+00
20201105A	Add Cascade System Relations	2026-07-06 22:05:20.846223+00
20201105B	Change Webhook URL Type	2026-07-06 22:05:20.853857+00
20210225A	Add Relations Sort Field	2026-07-06 22:05:20.857736+00
20210304A	Remove Locked Fields	2026-07-06 22:05:20.85966+00
20210312A	Webhooks Collections Text	2026-07-06 22:05:20.862742+00
20210331A	Add Refresh Interval	2026-07-06 22:05:20.864068+00
20210415A	Make Filesize Nullable	2026-07-06 22:05:20.867482+00
20210416A	Add Collections Accountability	2026-07-06 22:05:20.869823+00
20210422A	Remove Files Interface	2026-07-06 22:05:20.871152+00
20210506A	Rename Interfaces	2026-07-06 22:05:20.882409+00
20210510A	Restructure Relations	2026-07-06 22:05:20.88939+00
20210518A	Add Foreign Key Constraints	2026-07-06 22:05:20.894701+00
20210519A	Add System Fk Triggers	2026-07-06 22:05:20.91823+00
20210521A	Add Collections Icon Color	2026-07-06 22:05:20.91964+00
20210525A	Add Insights	2026-07-06 22:05:20.931701+00
20210608A	Add Deep Clone Config	2026-07-06 22:05:20.93386+00
20210626A	Change Filesize Bigint	2026-07-06 22:05:20.942459+00
20210716A	Add Conditions to Fields	2026-07-06 22:05:20.943918+00
20210721A	Add Default Folder	2026-07-06 22:05:20.947784+00
20210802A	Replace Groups	2026-07-06 22:05:20.950699+00
20210803A	Add Required to Fields	2026-07-06 22:05:20.952441+00
20210805A	Update Groups	2026-07-06 22:05:20.954996+00
20210805B	Change Image Metadata Structure	2026-07-06 22:05:20.957125+00
20210811A	Add Geometry Config	2026-07-06 22:05:20.958653+00
20210831A	Remove Limit Column	2026-07-06 22:05:20.960121+00
20210903A	Add Auth Provider	2026-07-06 22:05:20.969126+00
20210907A	Webhooks Collections Not Null	2026-07-06 22:05:20.973453+00
20210910A	Move Module Setup	2026-07-06 22:05:20.975817+00
20210920A	Webhooks URL Not Null	2026-07-06 22:05:20.979279+00
20210924A	Add Collection Organization	2026-07-06 22:05:20.983887+00
20210927A	Replace Fields Group	2026-07-06 22:05:20.989776+00
20210927B	Replace M2M Interface	2026-07-06 22:05:20.991198+00
20210929A	Rename Login Action	2026-07-06 22:05:20.992576+00
20211007A	Update Presets	2026-07-06 22:05:20.996628+00
20211009A	Add Auth Data	2026-07-06 22:05:20.998024+00
20211016A	Add Webhook Headers	2026-07-06 22:05:20.999331+00
20211103A	Set Unique to User Token	2026-07-06 22:05:21.001724+00
20211103B	Update Special Geometry	2026-07-06 22:05:21.003141+00
20211104A	Remove Collections Listing	2026-07-06 22:05:21.004593+00
20211118A	Add Notifications	2026-07-06 22:05:21.015421+00
20211211A	Add Shares	2026-07-06 22:05:21.028094+00
20211230A	Add Project Descriptor	2026-07-06 22:05:21.029642+00
20220303A	Remove Default Project Color	2026-07-06 22:05:21.033524+00
20220308A	Add Bookmark Icon and Color	2026-07-06 22:05:21.035308+00
20220314A	Add Translation Strings	2026-07-06 22:05:21.036635+00
20220322A	Rename Field Typecast Flags	2026-07-06 22:05:21.039074+00
20220323A	Add Field Validation	2026-07-06 22:05:21.04051+00
20220325A	Fix Typecast Flags	2026-07-06 22:05:21.043309+00
20220325B	Add Default Language	2026-07-06 22:05:21.048353+00
20220402A	Remove Default Value Panel Icon	2026-07-06 22:05:21.052168+00
20220429A	Add Flows	2026-07-06 22:05:21.071656+00
20220429B	Add Color to Insights Icon	2026-07-06 22:05:21.073444+00
20220429C	Drop Non Null From IP of Activity	2026-07-06 22:05:21.074692+00
20220429D	Drop Non Null From Sender of Notifications	2026-07-06 22:05:21.076095+00
20220614A	Rename Hook Trigger to Event	2026-07-06 22:05:21.077628+00
20220801A	Update Notifications Timestamp Column	2026-07-06 22:05:21.081689+00
20220802A	Add Custom Aspect Ratios	2026-07-06 22:05:21.083075+00
20220826A	Add Origin to Accountability	2026-07-06 22:05:21.084833+00
20230401A	Update Material Icons	2026-07-06 22:05:21.08934+00
20230525A	Add Preview Settings	2026-07-06 22:05:21.090728+00
20230526A	Migrate Translation Strings	2026-07-06 22:05:21.096466+00
20230721A	Require Shares Fields	2026-07-06 22:05:21.099483+00
20230823A	Add Content Versioning	2026-07-06 22:05:21.112364+00
20230927A	Themes	2026-07-06 22:05:21.122198+00
20231009A	Update CSV Fields to Text	2026-07-06 22:05:21.12474+00
20231009B	Update Panel Options	2026-07-06 22:05:21.126104+00
20231010A	Add Extensions	2026-07-06 22:05:21.128899+00
20231215A	Add Focalpoints	2026-07-06 22:05:21.13052+00
20240122A	Add Report URL Fields	2026-07-06 22:05:21.132246+00
20240204A	Marketplace	2026-07-06 22:05:21.146035+00
20240305A	Change Useragent Type	2026-07-06 22:05:21.151465+00
20240311A	Deprecate Webhooks	2026-07-06 22:05:21.157638+00
20240422A	Public Registration	2026-07-06 22:05:21.161983+00
20240515A	Add Session Window	2026-07-06 22:05:21.163424+00
20240701A	Add Tus Data	2026-07-06 22:05:21.165025+00
20240716A	Update Files Date Fields	2026-07-06 22:05:21.168533+00
20240806A	Permissions Policies	2026-07-06 22:05:21.195156+00
20240817A	Update Icon Fields Length	2026-07-06 22:05:21.213118+00
20240909A	Separate Comments	2026-07-06 22:05:21.222525+00
20240909B	Consolidate Content Versioning	2026-07-06 22:05:21.225272+00
20240924A	Migrate Legacy Comments	2026-07-06 22:05:21.229978+00
20240924B	Populate Versioning Deltas	2026-07-06 22:05:21.233334+00
20250224A	Visual Editor	2026-07-06 22:05:21.235607+00
20250609A	License Banner	2026-07-06 22:05:21.239157+00
20250613A	Add Project ID	2026-07-06 22:05:21.248299+00
20250718A	Add Direction	2026-07-06 22:05:21.250365+00
20250813A	Add MCP	2026-07-06 22:05:21.253424+00
20251012A	Add Field Searchable	2026-07-06 22:05:21.255784+00
20251014A	Add Project Owner	2026-07-06 22:05:21.290231+00
20251028A	Add Retention Indexes	2026-07-06 22:05:21.322473+00
20251103A	Add AI Settings	2026-07-06 22:05:21.324827+00
20251224A	Remove Webhooks	2026-07-06 22:05:21.330595+00
20260110A	Add AI Provider Settings	2026-07-06 22:05:21.334776+00
20260113A	Add Revisions Index	2026-07-06 22:05:21.343884+00
20260128A	Add Collaborative Editing	2026-07-06 22:05:21.345743+00
20260204A	Add Deployment	2026-07-06 22:05:21.366929+00
20260211A	Add Deployment Webhooks	2026-07-06 22:05:21.371273+00
\.


--
-- Data for Name: directus_notifications; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_notifications (id, "timestamp", status, recipient, sender, subject, message, collection, item) FROM stdin;
\.


--
-- Data for Name: directus_operations; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_operations (id, name, key, type, position_x, position_y, options, resolve, reject, flow, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_panels; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_panels (id, dashboard, name, icon, color, show_header, note, type, position_x, position_y, width, height, options, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_permissions; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_permissions (id, collection, action, permissions, validation, presets, fields, policy) FROM stdin;
\.


--
-- Data for Name: directus_policies; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_policies (id, name, icon, description, ip_access, enforce_tfa, admin_access, app_access) FROM stdin;
abf8a154-5b1c-4a46-ac9c-7300570f4f17	$t:public_label	public	$t:public_description	\N	f	f	f
7dd74b73-5e67-4949-b838-00ac07524324	Administrator	verified	$t:admin_description	\N	f	t	t
\.


--
-- Data for Name: directus_presets; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_presets (id, bookmark, "user", role, collection, search, layout, layout_query, layout_options, refresh_interval, filter, icon, color) FROM stdin;
\.


--
-- Data for Name: directus_relations; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_relations (id, many_collection, many_field, one_collection, one_field, one_collection_field, one_allowed_collections, junction_field, sort_field, one_deselect_action) FROM stdin;
1	medien	station	stations	medien	\N	\N	\N	\N	nullify
2	hotspots360	station	stations	hotspots360	\N	\N	\N	\N	nullify
3	dialog_segmente	station	stations	dialog_segmente	\N	\N	\N	\N	nullify
\.


--
-- Data for Name: directus_revisions; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_revisions (id, activity, collection, item, data, delta, parent, version) FROM stdin;
1	3	directus_fields	1	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	\N	\N
2	4	directus_fields	2	{"sort":2,"interface":"input","note":"kanonischer Slug, QR-fixiert (verzeichnisstruktur.md)","field":"slug"}	{"sort":2,"interface":"input","note":"kanonischer Slug, QR-fixiert (verzeichnisstruktur.md)","field":"slug"}	\N	\N
3	5	directus_fields	3	{"sort":3,"interface":"input","field":"titel"}	{"sort":3,"interface":"input","field":"titel"}	\N	\N
4	6	directus_fields	4	{"sort":4,"interface":"input-multiline","field":"beschreibung"}	{"sort":4,"interface":"input-multiline","field":"beschreibung"}	\N	\N
5	7	directus_fields	5	{"sort":5,"interface":"select-dropdown","options":{"choices":[{"text":"flat","value":"flat"},{"text":"equirectangular","value":"equirectangular"}]},"field":"viewer"}	{"sort":5,"interface":"select-dropdown","options":{"choices":[{"text":"flat","value":"flat"},{"text":"equirectangular","value":"equirectangular"}]},"field":"viewer"}	\N	\N
6	8	directus_fields	6	{"sort":6,"interface":"input","note":"Pfad unter public/ (Flat-Panorama)","field":"bild"}	{"sort":6,"interface":"input","note":"Pfad unter public/ (Flat-Panorama)","field":"bild"}	\N	\N
7	9	directus_fields	7	{"sort":7,"interface":"input","note":"Pfad unter public/ (equirectangular 2:1)","field":"panorama360"}	{"sort":7,"interface":"input","note":"Pfad unter public/ (equirectangular 2:1)","field":"panorama360"}	\N	\N
8	10	directus_fields	8	{"sort":8,"interface":"input","field":"startYaw"}	{"sort":8,"interface":"input","field":"startYaw"}	\N	\N
9	11	directus_fields	9	{"sort":9,"interface":"input","field":"startPitch"}	{"sort":9,"interface":"input","field":"startPitch"}	\N	\N
10	12	directus_fields	10	{"sort":10,"interface":"input","field":"startPanX"}	{"sort":10,"interface":"input","field":"startPanX"}	\N	\N
11	13	directus_fields	11	{"sort":11,"interface":"tags","note":"z.B. [\\"frieda\\",\\"otto\\"] - Directus hat keinen nativen String-Enum-Array-Typ ohne M2M; JSON-Feld als pragmatischer Spike-Kompromiss (Editor-UX-Befund)","field":"dialog_figuren","special":["cast-json"]}	{"sort":11,"interface":"tags","note":"z.B. [\\"frieda\\",\\"otto\\"] - Directus hat keinen nativen String-Enum-Array-Typ ohne M2M; JSON-Feld als pragmatischer Spike-Kompromiss (Editor-UX-Befund)","field":"dialog_figuren","special":["cast-json"]}	\N	\N
12	14	directus_collections	stations	{"note":"Spike #251 - eine Station (klassenzimmer)","collection":"stations"}	{"note":"Spike #251 - eine Station (klassenzimmer)","collection":"stations"}	\N	\N
13	15	directus_fields	12	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	\N	\N
14	16	directus_fields	13	{"sort":2,"interface":"input","note":"semantische ID = medium.id aus JSON; Directus-PK bleibt intern (F4)","field":"key"}	{"sort":2,"interface":"input","note":"semantische ID = medium.id aus JSON; Directus-PK bleibt intern (F4)","field":"key"}	\N	\N
15	17	directus_fields	14	{"sort":3,"interface":"select-dropdown","options":{"choices":[{"text":"audio","value":"audio"},{"text":"video","value":"video"},{"text":"foto","value":"foto"},{"text":"text","value":"text"},{"text":"link","value":"link"},{"text":"embed","value":"embed"}]},"field":"typ"}	{"sort":3,"interface":"select-dropdown","options":{"choices":[{"text":"audio","value":"audio"},{"text":"video","value":"video"},{"text":"foto","value":"foto"},{"text":"text","value":"text"},{"text":"link","value":"link"},{"text":"embed","value":"embed"}]},"field":"typ"}	\N	\N
16	18	directus_fields	15	{"sort":4,"interface":"input","field":"quelle"}	{"sort":4,"interface":"input","field":"quelle"}	\N	\N
17	19	directus_fields	16	{"sort":5,"interface":"select-dropdown","options":{"choices":[{"text":"upload","value":"upload"},{"text":"youtube","value":"youtube"}]},"field":"videoSource"}	{"sort":5,"interface":"select-dropdown","options":{"choices":[{"text":"upload","value":"upload"},{"text":"youtube","value":"youtube"}]},"field":"videoSource"}	\N	\N
18	20	directus_fields	17	{"sort":6,"interface":"input","field":"poster"}	{"sort":6,"interface":"input","field":"poster"}	\N	\N
19	21	directus_fields	18	{"sort":7,"interface":"input","field":"thumbnail"}	{"sort":7,"interface":"input","field":"thumbnail"}	\N	\N
20	22	directus_fields	19	{"sort":8,"interface":"select-dropdown","options":{"choices":[{"text":"external","value":"external"}]},"field":"openIn"}	{"sort":8,"interface":"select-dropdown","options":{"choices":[{"text":"external","value":"external"}]},"field":"openIn"}	\N	\N
21	23	directus_fields	20	{"sort":9,"interface":"tags","field":"embedAllow","special":["cast-json"]}	{"sort":9,"interface":"tags","field":"embedAllow","special":["cast-json"]}	\N	\N
22	24	directus_fields	21	{"sort":10,"interface":"input","field":"untertitel"}	{"sort":10,"interface":"input","field":"untertitel"}	\N	\N
23	25	directus_fields	22	{"sort":11,"interface":"select-dropdown-m2o","hidden":true,"field":"station"}	{"sort":11,"interface":"select-dropdown-m2o","hidden":true,"field":"station"}	\N	\N
24	26	directus_collections	medien	{"note":"Spike #251 - O2M von stations","collection":"medien"}	{"note":"Spike #251 - O2M von stations","collection":"medien"}	\N	\N
25	27	directus_fields	23	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	\N	\N
26	28	directus_fields	24	{"sort":2,"interface":"input","note":"semantische ID = hotspot.id aus JSON","field":"key"}	{"sort":2,"interface":"input","note":"semantische ID = hotspot.id aus JSON","field":"key"}	\N	\N
27	29	directus_fields	25	{"sort":3,"interface":"input","field":"label"}	{"sort":3,"interface":"input","field":"label"}	\N	\N
28	30	directus_fields	26	{"sort":4,"interface":"select-dropdown","options":{"choices":[{"text":"medium","value":"medium"},{"text":"dialog","value":"dialog"}]},"note":"Default medium","field":"action"}	{"sort":4,"interface":"select-dropdown","options":{"choices":[{"text":"medium","value":"medium"},{"text":"dialog","value":"dialog"}]},"note":"Default medium","field":"action"}	\N	\N
29	31	directus_fields	27	{"sort":5,"interface":"input","note":"verweist auf medien.key (kein hartes FK im Spike - Modellierungsfrage fuer #256)","field":"mediumId"}	{"sort":5,"interface":"input","note":"verweist auf medien.key (kein hartes FK im Spike - Modellierungsfrage fuer #256)","field":"mediumId"}	\N	\N
30	32	directus_fields	28	{"sort":6,"interface":"select-dropdown","options":{"choices":[{"text":"frieda","value":"frieda"},{"text":"otto","value":"otto"}]},"field":"mascot"}	{"sort":6,"interface":"select-dropdown","options":{"choices":[{"text":"frieda","value":"frieda"},{"text":"otto","value":"otto"}]},"field":"mascot"}	\N	\N
31	33	directus_fields	29	{"sort":7,"interface":"input","field":"mascotSize"}	{"sort":7,"interface":"input","field":"mascotSize"}	\N	\N
32	34	directus_fields	30	{"sort":8,"interface":"boolean","field":"mascotFlipX"}	{"sort":8,"interface":"boolean","field":"mascotFlipX"}	\N	\N
33	35	directus_fields	31	{"sort":9,"interface":"input","field":"bubblePitchOffset"}	{"sort":9,"interface":"input","field":"bubblePitchOffset"}	\N	\N
34	36	directus_fields	32	{"sort":10,"interface":"input","field":"icon"}	{"sort":10,"interface":"input","field":"icon"}	\N	\N
35	37	directus_fields	33	{"sort":11,"interface":"input","field":"iconSize"}	{"sort":11,"interface":"input","field":"iconSize"}	\N	\N
36	38	directus_fields	34	{"sort":12,"interface":"input","field":"yaw"}	{"sort":12,"interface":"input","field":"yaw"}	\N	\N
37	39	directus_fields	35	{"sort":13,"interface":"input","field":"pitch"}	{"sort":13,"interface":"input","field":"pitch"}	\N	\N
38	40	directus_fields	36	{"sort":14,"interface":"select-dropdown-m2o","hidden":true,"field":"station"}	{"sort":14,"interface":"select-dropdown-m2o","hidden":true,"field":"station"}	\N	\N
39	41	directus_collections	hotspots360	{"note":"Spike #251 - O2M von stations","collection":"hotspots360"}	{"note":"Spike #251 - O2M von stations","collection":"hotspots360"}	\N	\N
40	42	directus_fields	37	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	{"sort":1,"interface":"input","readonly":true,"hidden":true,"field":"id"}	\N	\N
41	43	directus_fields	38	{"sort":2,"interface":"input","note":"semantische ID = segment.id aus JSON","field":"key"}	{"sort":2,"interface":"input","note":"semantische ID = segment.id aus JSON","field":"key"}	\N	\N
42	44	directus_fields	39	{"sort":3,"interface":"input","note":"Segment-Reihenfolge (JSON-Array-Position, Directus hat keine native Array-Ordnung ausserhalb von M2M/O2M sort)","field":"sort"}	{"sort":3,"interface":"input","note":"Segment-Reihenfolge (JSON-Array-Position, Directus hat keine native Array-Ordnung ausserhalb von M2M/O2M sort)","field":"sort"}	\N	\N
43	45	directus_fields	40	{"sort":4,"interface":"select-dropdown","options":{"choices":[{"text":"frieda","value":"frieda"},{"text":"otto","value":"otto"},{"text":"beide","value":"beide"}]},"field":"rolle"}	{"sort":4,"interface":"select-dropdown","options":{"choices":[{"text":"frieda","value":"frieda"},{"text":"otto","value":"otto"},{"text":"beide","value":"beide"}]},"field":"rolle"}	\N	\N
44	46	directus_fields	41	{"sort":5,"interface":"input","note":"fehlt = text-only Segment (ADR-026)","field":"quelle"}	{"sort":5,"interface":"input","note":"fehlt = text-only Segment (ADR-026)","field":"quelle"}	\N	\N
45	47	directus_fields	42	{"sort":6,"interface":"input-multiline","field":"text"}	{"sort":6,"interface":"input-multiline","field":"text"}	\N	\N
46	48	directus_fields	43	{"sort":7,"interface":"input","field":"gruppe"}	{"sort":7,"interface":"input","field":"gruppe"}	\N	\N
47	49	directus_fields	44	{"sort":8,"interface":"select-dropdown","options":{"choices":[{"text":"left","value":"left"},{"text":"right","value":"right"},{"text":"center","value":"center"}]},"field":"tail"}	{"sort":8,"interface":"select-dropdown","options":{"choices":[{"text":"left","value":"left"},{"text":"right","value":"right"},{"text":"center","value":"center"}]},"field":"tail"}	\N	\N
48	50	directus_fields	45	{"sort":9,"interface":"select-dropdown-m2o","hidden":true,"field":"station"}	{"sort":9,"interface":"select-dropdown-m2o","hidden":true,"field":"station"}	\N	\N
49	51	directus_collections	dialog_segmente	{"note":"Spike #251 - O2M von stations","collection":"dialog_segmente"}	{"note":"Spike #251 - O2M von stations","collection":"dialog_segmente"}	\N	\N
50	52	stations	1	{"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!","viewer":"equirectangular","panorama360":"/stations/360/klassenzimmer.jpg","bild":"/stations/klassenzimmer.jpg","dialog_figuren":["frieda","otto"]}	{"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!","viewer":"equirectangular","panorama360":"/stations/360/klassenzimmer.jpg","bild":"/stations/klassenzimmer.jpg","dialog_figuren":["frieda","otto"]}	\N	\N
51	53	medien	1	{"key":"demo-audio","typ":"audio","quelle":"/media/klassenzimmer/audio/grundschule_demo.mp3","untertitel":"Mein Schultag (Audio)"}	{"key":"demo-audio","typ":"audio","quelle":"/media/klassenzimmer/audio/grundschule_demo.mp3","untertitel":"Mein Schultag (Audio)"}	\N	\N
52	54	medien	2	{"key":"demo-video","typ":"video","videoSource":"upload","quelle":"/media/klassenzimmer/video/grundschule_demo.mp4","poster":"/media/klassenzimmer/fotos/grundschule_demo.jpg","thumbnail":"/media/klassenzimmer/fotos/grundschule_demo.jpg","untertitel":"Mein Schultag (Video)"}	{"key":"demo-video","typ":"video","videoSource":"upload","quelle":"/media/klassenzimmer/video/grundschule_demo.mp4","poster":"/media/klassenzimmer/fotos/grundschule_demo.jpg","thumbnail":"/media/klassenzimmer/fotos/grundschule_demo.jpg","untertitel":"Mein Schultag (Video)"}	\N	\N
53	55	medien	3	{"key":"demo-foto","typ":"foto","quelle":"/media/klassenzimmer/fotos/grundschule_demo.jpg","untertitel":"Schulfoto"}	{"key":"demo-foto","typ":"foto","quelle":"/media/klassenzimmer/fotos/grundschule_demo.jpg","untertitel":"Schulfoto"}	\N	\N
54	56	medien	4	{"key":"demo-text","typ":"text","quelle":"/media/klassenzimmer/texte/grundschule_demo.md","untertitel":"Mein Schultag"}	{"key":"demo-text","typ":"text","quelle":"/media/klassenzimmer/texte/grundschule_demo.md","untertitel":"Mein Schultag"}	\N	\N
55	57	hotspots360	1	{"key":"hs-text","label":"Korkpinnwand","yaw":-32,"pitch":-4,"mediumId":"demo-text","iconSize":0.2}	{"key":"hs-text","label":"Korkpinnwand","yaw":-32,"pitch":-4,"mediumId":"demo-text","iconSize":0.2}	\N	\N
56	58	hotspots360	2	{"key":"hs-video","label":"Tafel","yaw":-18,"pitch":0,"mediumId":"demo-video","icon":"/media/klassenzimmer/icons/play.svg","iconSize":0.2}	{"key":"hs-video","label":"Tafel","yaw":-18,"pitch":0,"mediumId":"demo-video","icon":"/media/klassenzimmer/icons/play.svg","iconSize":0.2}	\N	\N
57	59	hotspots360	3	{"key":"hs-audio","label":"Klassentische","yaw":4,"pitch":-8,"mediumId":"demo-audio","iconSize":0.2}	{"key":"hs-audio","label":"Klassentische","yaw":4,"pitch":-8,"mediumId":"demo-audio","iconSize":0.2}	\N	\N
58	60	hotspots360	4	{"key":"hs-foto","label":"Fensterseite","yaw":28,"pitch":-2,"mediumId":"demo-foto","iconSize":0.2}	{"key":"hs-foto","label":"Fensterseite","yaw":28,"pitch":-2,"mediumId":"demo-foto","iconSize":0.2}	\N	\N
59	61	hotspots360	5	{"key":"hs-frieda","label":"Frieda","yaw":-80,"pitch":-18,"action":"dialog","mascot":"frieda","mascotSize":0.28,"mascotFlipX":false,"bubblePitchOffset":12}	{"key":"hs-frieda","label":"Frieda","yaw":-80,"pitch":-18,"action":"dialog","mascot":"frieda","mascotSize":0.28,"mascotFlipX":false,"bubblePitchOffset":12}	\N	\N
77	80	directus_permissions	1	{"collection":"directus_files","action":"read","permissions":{},"fields":["*"]}	{"collection":"directus_files","action":"read","permissions":{},"fields":["*"]}	\N	\N
60	62	hotspots360	6	{"key":"hs-otto","label":"Otto","yaw":80,"pitch":-18,"action":"dialog","mascot":"otto","mascotSize":0.28,"mascotFlipX":true,"bubblePitchOffset":12}	{"key":"hs-otto","label":"Otto","yaw":80,"pitch":-18,"action":"dialog","mascot":"otto","mascotSize":0.28,"mascotFlipX":true,"bubblePitchOffset":12}	\N	\N
61	63	dialog_segmente	1	{"key":"k1","sort":1,"rolle":"frieda","text":"Hallo! Schön, dass du bei uns im Klassenzimmer vorbeischaust."}	{"key":"k1","sort":1,"rolle":"frieda","text":"Hallo! Schön, dass du bei uns im Klassenzimmer vorbeischaust."}	\N	\N
62	64	dialog_segmente	2	{"key":"k2","sort":2,"rolle":"otto","text":"Hier sitzen wir jeden Tag zusammen und lernen Lesen, Schreiben und Rechnen."}	{"key":"k2","sort":2,"rolle":"otto","text":"Hier sitzen wir jeden Tag zusammen und lernen Lesen, Schreiben und Rechnen."}	\N	\N
63	65	dialog_segmente	3	{"key":"k3","sort":3,"rolle":"frieda","text":"An der Tafel zeigt unsere Lehrerin neue Aufgaben, und an der Pinnwand hängen unsere schönsten Bilder."}	{"key":"k3","sort":3,"rolle":"frieda","text":"An der Tafel zeigt unsere Lehrerin neue Aufgaben, und an der Pinnwand hängen unsere schönsten Bilder."}	\N	\N
64	66	dialog_segmente	4	{"key":"k4","sort":4,"rolle":"otto","text":"Schau dich ruhig um — an den Hotspots gibt es Fotos, ein Video und sogar Töne aus unserem Klassenzimmer zu entdecken."}	{"key":"k4","sort":4,"rolle":"otto","text":"Schau dich ruhig um — an den Hotspots gibt es Fotos, ein Video und sogar Töne aus unserem Klassenzimmer zu entdecken."}	\N	\N
65	67	directus_fields	46	{"sort":12,"interface":"list-o2m","special":["o2m"],"field":"medien"}	{"sort":12,"interface":"list-o2m","special":["o2m"],"field":"medien"}	\N	\N
66	68	directus_fields	47	{"sort":13,"interface":"list-o2m","special":["o2m"],"field":"hotspots360"}	{"sort":13,"interface":"list-o2m","special":["o2m"],"field":"hotspots360"}	\N	\N
67	69	directus_fields	48	{"sort":14,"interface":"list-o2m","special":["o2m"],"field":"dialog_segmente"}	{"sort":14,"interface":"list-o2m","special":["o2m"],"field":"dialog_segmente"}	\N	\N
68	70	directus_users	5103b020-9ed3-416e-8503-6af468af1ce6	{"id":"5103b020-9ed3-416e-8503-6af468af1ce6","first_name":"Admin","last_name":"User","email":"admin@example.com","password":"**********","location":null,"title":null,"description":null,"tags":null,"language":null,"tfa_secret":null,"status":"active","token":"**********","last_access":"2026-07-06T22:10:32.122Z","last_page":null,"provider":"default","external_identifier":null,"auth_data":null,"email_notifications":true,"appearance":null,"theme_dark":null,"theme_light":null,"theme_light_overrides":null,"theme_dark_overrides":null,"text_direction":"auto"}	{"token":"**********"}	\N	\N
69	71	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"SPIKE-VERIFIKATION: Dieser Text kommt garantiert aus Directus, nicht aus stations.json.","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"SPIKE-VERIFIKATION: Dieser Text kommt garantiert aus Directus, nicht aus stations.json."}	\N	\N
70	72	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!"}	\N	\N
71	74	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"SPIKE-VERIFIKATION-LIVE: Coolify-App liest live von Directus.","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"SPIKE-VERIFIKATION-LIVE: Coolify-App liest live von Directus."}	\N	\N
72	75	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen"}	\N	\N
73	76	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!"}	\N	\N
74	77	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"SPIKE-LATENZ-MESSUNG-A: Publish-Zeitstempel markiert.","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"SPIKE-LATENZ-MESSUNG-A: Publish-Zeitstempel markiert."}	\N	\N
75	78	stations	1	{"id":1,"slug":"klassenzimmer","titel":"Klassenzimmer","beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!","viewer":"equirectangular","bild":"/stations/klassenzimmer.jpg","panorama360":"/stations/360/klassenzimmer.jpg","startYaw":null,"startPitch":null,"startPanX":null,"dialog_figuren":["frieda","otto"]}	{"beschreibung":"Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!"}	\N	\N
76	79	directus_files	f324cbe9-4c56-44ca-92ac-891caa81ebf8	{"storage":"local","title":"Spike-Dummy-Testbild (kein Schueler-Medium)","filename_download":"dummy-testbild.png","type":"image/png"}	{"storage":"local","title":"Spike-Dummy-Testbild (kein Schueler-Medium)","filename_download":"dummy-testbild.png","type":"image/png"}	\N	\N
\.


--
-- Data for Name: directus_roles; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_roles (id, name, icon, description, parent) FROM stdin;
d28898ab-fa87-46be-813e-60911579474f	Administrator	verified	$t:admin_description	\N
\.


--
-- Data for Name: directus_sessions; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_sessions (token, "user", expires, ip, user_agent, share, origin, next_token) FROM stdin;
ZI2obJy9ZyjTfjK01LlrJUXy-1777KyNpcGUP0i5ouhIbauGeXF9z4JkF7KMJhbz	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-13 22:06:09.01+00	178.26.66.91	curl/8.7.1	\N	\N	\N
QlNYTDYRs5yyTQTmvRlfFcz2IabyZNz49F6eyxkxR7eKjX2rcTrCyK2iAv7AmnTP	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-13 22:10:32.116+00	178.26.66.91	curl/8.7.1	\N	\N	\N
hRndBh75yO3AF168HVIK4H27p6ZQZ1jTgJo2_sgWEimQdz_kFw4AjaUKL4Irmliz	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-13 22:32:40.793+00	178.26.66.91	curl/8.7.1	\N	\N	\N
mj4ALKSty8peoyhI0t4LpiaUcMhtWQVDsM8p8PmsqmK8iWj87n3Lt_NXb7V0qWEK	5103b020-9ed3-416e-8503-6af468af1ce6	2026-07-13 22:48:29.371+00	178.26.66.91	curl/8.7.1	\N	\N	\N
\.


--
-- Data for Name: directus_settings; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_settings (id, project_name, project_url, project_color, project_logo, public_foreground, public_background, public_note, auth_login_attempts, auth_password_policy, storage_asset_transform, storage_asset_presets, custom_css, storage_default_folder, basemaps, mapbox_key, module_bar, project_descriptor, default_language, custom_aspect_ratios, public_favicon, default_appearance, default_theme_light, theme_light_overrides, default_theme_dark, theme_dark_overrides, report_error_url, report_bug_url, report_feature_url, public_registration, public_registration_verify_email, public_registration_role, public_registration_email_filter, visual_editor_urls, project_id, mcp_enabled, mcp_allow_deletes, mcp_prompts_collection, mcp_system_prompt_enabled, mcp_system_prompt, project_owner, project_usage, org_name, product_updates, project_status, ai_openai_api_key, ai_anthropic_api_key, ai_system_prompt, ai_google_api_key, ai_openai_compatible_api_key, ai_openai_compatible_base_url, ai_openai_compatible_name, ai_openai_compatible_models, ai_openai_compatible_headers, ai_openai_allowed_models, ai_anthropic_allowed_models, ai_google_allowed_models, collaborative_editing_enabled) FROM stdin;
1	Directus	\N	#6644FF	\N	\N	\N	\N	25	\N	all	\N	\N	\N	\N	\N	\N	\N	en-US	\N	\N	auto	\N	\N	\N	\N	\N	\N	\N	f	t	\N	\N	\N	019f3976-e5de-745d-92f9-9799bd7bb04a	f	f	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	["gpt-5-nano","gpt-5-mini","gpt-5"]	["claude-haiku-4-5","claude-sonnet-4-5"]	["gemini-3-pro-preview","gemini-3-flash-preview","gemini-2.5-pro","gemini-2.5-flash"]	f
\.


--
-- Data for Name: directus_shares; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_shares (id, name, collection, item, role, password, user_created, date_created, date_start, date_end, times_used, max_uses) FROM stdin;
\.


--
-- Data for Name: directus_translations; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_translations (id, language, key, value) FROM stdin;
\.


--
-- Data for Name: directus_users; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_users (id, first_name, last_name, email, password, location, title, description, tags, avatar, language, tfa_secret, status, role, token, last_access, last_page, provider, external_identifier, auth_data, email_notifications, appearance, theme_dark, theme_light, theme_light_overrides, theme_dark_overrides, text_direction) FROM stdin;
5103b020-9ed3-416e-8503-6af468af1ce6	Admin	User	admin@example.com	$argon2id$v=19$m=65536,t=3,p=4$4YvPnVq1B3F0jTxdMvkqAg$Wm/TMxCkt169doT3B3B6K2liEg2hr4ojrVr2Ob54kbc	\N	\N	\N	\N	\N	\N	\N	active	d28898ab-fa87-46be-813e-60911579474f	epI_GSVBQ9n3dLr225Nca63nytua_fQ8j4s-YzaluAA	2026-07-06 22:48:29.377+00	\N	default	\N	\N	t	\N	\N	\N	\N	\N	auto
\.


--
-- Data for Name: directus_versions; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.directus_versions (id, key, name, collection, item, hash, date_created, date_updated, user_created, user_updated, delta) FROM stdin;
\.


--
-- Data for Name: hotspots360; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.hotspots360 (id, key, label, action, "mediumId", mascot, "mascotSize", "mascotFlipX", "bubblePitchOffset", icon, "iconSize", yaw, pitch, station) FROM stdin;
1	hs-text	Korkpinnwand	\N	demo-text	\N	\N	f	\N	\N	0.2	-32	-4	1
2	hs-video	Tafel	\N	demo-video	\N	\N	f	\N	/media/klassenzimmer/icons/play.svg	0.2	-18	0	1
3	hs-audio	Klassentische	\N	demo-audio	\N	\N	f	\N	\N	0.2	4	-8	1
4	hs-foto	Fensterseite	\N	demo-foto	\N	\N	f	\N	\N	0.2	28	-2	1
5	hs-frieda	Frieda	dialog	\N	frieda	0.28	f	12	\N	\N	-80	-18	1
6	hs-otto	Otto	dialog	\N	otto	0.28	t	12	\N	\N	80	-18	1
\.


--
-- Data for Name: medien; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.medien (id, key, typ, quelle, "videoSource", poster, thumbnail, "openIn", "embedAllow", untertitel, station) FROM stdin;
1	demo-audio	audio	/media/klassenzimmer/audio/grundschule_demo.mp3	\N	\N	\N	\N	\N	Mein Schultag (Audio)	1
2	demo-video	video	/media/klassenzimmer/video/grundschule_demo.mp4	upload	/media/klassenzimmer/fotos/grundschule_demo.jpg	/media/klassenzimmer/fotos/grundschule_demo.jpg	\N	\N	Mein Schultag (Video)	1
3	demo-foto	foto	/media/klassenzimmer/fotos/grundschule_demo.jpg	\N	\N	\N	\N	\N	Schulfoto	1
4	demo-text	text	/media/klassenzimmer/texte/grundschule_demo.md	\N	\N	\N	\N	\N	Mein Schultag	1
\.


--
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: directus
--

COPY public.stations (id, slug, titel, beschreibung, viewer, bild, panorama360, "startYaw", "startPitch", "startPanX", dialog_figuren) FROM stdin;
1	klassenzimmer	Klassenzimmer	Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!	equirectangular	/stations/klassenzimmer.jpg	/stations/360/klassenzimmer.jpg	\N	\N	\N	["frieda","otto"]
\.


--
-- Name: dialog_segmente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.dialog_segmente_id_seq', 4, true);


--
-- Name: directus_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_activity_id_seq', 83, true);


--
-- Name: directus_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_fields_id_seq', 48, true);


--
-- Name: directus_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_notifications_id_seq', 1, false);


--
-- Name: directus_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_permissions_id_seq', 1, true);


--
-- Name: directus_presets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_presets_id_seq', 1, false);


--
-- Name: directus_relations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_relations_id_seq', 3, true);


--
-- Name: directus_revisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_revisions_id_seq', 77, true);


--
-- Name: directus_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.directus_settings_id_seq', 1, true);


--
-- Name: hotspots360_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.hotspots360_id_seq', 6, true);


--
-- Name: medien_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.medien_id_seq', 4, true);


--
-- Name: stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: directus
--

SELECT pg_catalog.setval('public.stations_id_seq', 1, true);


--
-- Name: dialog_segmente dialog_segmente_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.dialog_segmente
    ADD CONSTRAINT dialog_segmente_pkey PRIMARY KEY (id);


--
-- Name: directus_access directus_access_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_pkey PRIMARY KEY (id);


--
-- Name: directus_activity directus_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_activity
    ADD CONSTRAINT directus_activity_pkey PRIMARY KEY (id);


--
-- Name: directus_collections directus_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_pkey PRIMARY KEY (collection);


--
-- Name: directus_comments directus_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_pkey PRIMARY KEY (id);


--
-- Name: directus_dashboards directus_dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_dashboards
    ADD CONSTRAINT directus_dashboards_pkey PRIMARY KEY (id);


--
-- Name: directus_deployment_projects directus_deployment_projects_deployment_external_id_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_projects
    ADD CONSTRAINT directus_deployment_projects_deployment_external_id_unique UNIQUE (deployment, external_id);


--
-- Name: directus_deployment_projects directus_deployment_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_projects
    ADD CONSTRAINT directus_deployment_projects_pkey PRIMARY KEY (id);


--
-- Name: directus_deployment_runs directus_deployment_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_runs
    ADD CONSTRAINT directus_deployment_runs_pkey PRIMARY KEY (id);


--
-- Name: directus_deployments directus_deployments_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployments
    ADD CONSTRAINT directus_deployments_pkey PRIMARY KEY (id);


--
-- Name: directus_deployments directus_deployments_provider_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployments
    ADD CONSTRAINT directus_deployments_provider_unique UNIQUE (provider);


--
-- Name: directus_extensions directus_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_extensions
    ADD CONSTRAINT directus_extensions_pkey PRIMARY KEY (id);


--
-- Name: directus_fields directus_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_fields
    ADD CONSTRAINT directus_fields_pkey PRIMARY KEY (id);


--
-- Name: directus_files directus_files_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_pkey PRIMARY KEY (id);


--
-- Name: directus_flows directus_flows_operation_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_operation_unique UNIQUE (operation);


--
-- Name: directus_flows directus_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_pkey PRIMARY KEY (id);


--
-- Name: directus_folders directus_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_folders
    ADD CONSTRAINT directus_folders_pkey PRIMARY KEY (id);


--
-- Name: directus_migrations directus_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_migrations
    ADD CONSTRAINT directus_migrations_pkey PRIMARY KEY (version);


--
-- Name: directus_notifications directus_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_reject_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_unique UNIQUE (reject);


--
-- Name: directus_operations directus_operations_resolve_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_unique UNIQUE (resolve);


--
-- Name: directus_panels directus_panels_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_pkey PRIMARY KEY (id);


--
-- Name: directus_permissions directus_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_permissions
    ADD CONSTRAINT directus_permissions_pkey PRIMARY KEY (id);


--
-- Name: directus_policies directus_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_policies
    ADD CONSTRAINT directus_policies_pkey PRIMARY KEY (id);


--
-- Name: directus_presets directus_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_pkey PRIMARY KEY (id);


--
-- Name: directus_relations directus_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_relations
    ADD CONSTRAINT directus_relations_pkey PRIMARY KEY (id);


--
-- Name: directus_revisions directus_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_pkey PRIMARY KEY (id);


--
-- Name: directus_roles directus_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_roles
    ADD CONSTRAINT directus_roles_pkey PRIMARY KEY (id);


--
-- Name: directus_sessions directus_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_pkey PRIMARY KEY (token);


--
-- Name: directus_settings directus_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_pkey PRIMARY KEY (id);


--
-- Name: directus_shares directus_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_pkey PRIMARY KEY (id);


--
-- Name: directus_translations directus_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_translations
    ADD CONSTRAINT directus_translations_pkey PRIMARY KEY (id);


--
-- Name: directus_users directus_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_email_unique UNIQUE (email);


--
-- Name: directus_users directus_users_external_identifier_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_external_identifier_unique UNIQUE (external_identifier);


--
-- Name: directus_users directus_users_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_pkey PRIMARY KEY (id);


--
-- Name: directus_users directus_users_token_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_token_unique UNIQUE (token);


--
-- Name: directus_versions directus_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_pkey PRIMARY KEY (id);


--
-- Name: hotspots360 hotspots360_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.hotspots360
    ADD CONSTRAINT hotspots360_pkey PRIMARY KEY (id);


--
-- Name: medien medien_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.medien
    ADD CONSTRAINT medien_pkey PRIMARY KEY (id);


--
-- Name: stations stations_pkey; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (id);


--
-- Name: stations stations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_slug_unique UNIQUE (slug);


--
-- Name: directus_activity_timestamp_index; Type: INDEX; Schema: public; Owner: directus
--

CREATE INDEX directus_activity_timestamp_index ON public.directus_activity USING btree ("timestamp");


--
-- Name: directus_revisions_activity_index; Type: INDEX; Schema: public; Owner: directus
--

CREATE INDEX directus_revisions_activity_index ON public.directus_revisions USING btree (activity);


--
-- Name: directus_revisions_parent_index; Type: INDEX; Schema: public; Owner: directus
--

CREATE INDEX directus_revisions_parent_index ON public.directus_revisions USING btree (parent);


--
-- Name: dialog_segmente dialog_segmente_station_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.dialog_segmente
    ADD CONSTRAINT dialog_segmente_station_foreign FOREIGN KEY (station) REFERENCES public.stations(id);


--
-- Name: directus_access directus_access_policy_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_policy_foreign FOREIGN KEY (policy) REFERENCES public.directus_policies(id) ON DELETE CASCADE;


--
-- Name: directus_access directus_access_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_access directus_access_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_collections directus_collections_group_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_group_foreign FOREIGN KEY ("group") REFERENCES public.directus_collections(collection);


--
-- Name: directus_comments directus_comments_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_comments directus_comments_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: directus_dashboards directus_dashboards_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_dashboards
    ADD CONSTRAINT directus_dashboards_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_deployment_projects directus_deployment_projects_deployment_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_projects
    ADD CONSTRAINT directus_deployment_projects_deployment_foreign FOREIGN KEY (deployment) REFERENCES public.directus_deployments(id) ON DELETE CASCADE;


--
-- Name: directus_deployment_projects directus_deployment_projects_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_projects
    ADD CONSTRAINT directus_deployment_projects_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_deployment_runs directus_deployment_runs_project_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_runs
    ADD CONSTRAINT directus_deployment_runs_project_foreign FOREIGN KEY (project) REFERENCES public.directus_deployment_projects(id) ON DELETE CASCADE;


--
-- Name: directus_deployment_runs directus_deployment_runs_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployment_runs
    ADD CONSTRAINT directus_deployment_runs_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_deployments directus_deployments_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_deployments
    ADD CONSTRAINT directus_deployments_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_files directus_files_folder_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_folder_foreign FOREIGN KEY (folder) REFERENCES public.directus_folders(id) ON DELETE SET NULL;


--
-- Name: directus_files directus_files_modified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_modified_by_foreign FOREIGN KEY (modified_by) REFERENCES public.directus_users(id);


--
-- Name: directus_files directus_files_uploaded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES public.directus_users(id);


--
-- Name: directus_flows directus_flows_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_folders directus_folders_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_folders
    ADD CONSTRAINT directus_folders_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_folders(id);


--
-- Name: directus_notifications directus_notifications_recipient_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_recipient_foreign FOREIGN KEY (recipient) REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_notifications directus_notifications_sender_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_sender_foreign FOREIGN KEY (sender) REFERENCES public.directus_users(id);


--
-- Name: directus_operations directus_operations_flow_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_flow_foreign FOREIGN KEY (flow) REFERENCES public.directus_flows(id) ON DELETE CASCADE;


--
-- Name: directus_operations directus_operations_reject_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_foreign FOREIGN KEY (reject) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_resolve_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_foreign FOREIGN KEY (resolve) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_panels directus_panels_dashboard_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_dashboard_foreign FOREIGN KEY (dashboard) REFERENCES public.directus_dashboards(id) ON DELETE CASCADE;


--
-- Name: directus_panels directus_panels_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_permissions directus_permissions_policy_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_permissions
    ADD CONSTRAINT directus_permissions_policy_foreign FOREIGN KEY (policy) REFERENCES public.directus_policies(id) ON DELETE CASCADE;


--
-- Name: directus_presets directus_presets_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_presets directus_presets_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_revisions directus_revisions_activity_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_activity_foreign FOREIGN KEY (activity) REFERENCES public.directus_activity(id) ON DELETE CASCADE;


--
-- Name: directus_revisions directus_revisions_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_revisions(id);


--
-- Name: directus_revisions directus_revisions_version_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_version_foreign FOREIGN KEY (version) REFERENCES public.directus_versions(id) ON DELETE CASCADE;


--
-- Name: directus_roles directus_roles_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_roles
    ADD CONSTRAINT directus_roles_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_roles(id);


--
-- Name: directus_sessions directus_sessions_share_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_share_foreign FOREIGN KEY (share) REFERENCES public.directus_shares(id) ON DELETE CASCADE;


--
-- Name: directus_sessions directus_sessions_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_settings directus_settings_project_logo_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_project_logo_foreign FOREIGN KEY (project_logo) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_background_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_background_foreign FOREIGN KEY (public_background) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_favicon_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_favicon_foreign FOREIGN KEY (public_favicon) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_foreground_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_foreground_foreign FOREIGN KEY (public_foreground) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_registration_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_registration_role_foreign FOREIGN KEY (public_registration_role) REFERENCES public.directus_roles(id) ON DELETE SET NULL;


--
-- Name: directus_settings directus_settings_storage_default_folder_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_storage_default_folder_foreign FOREIGN KEY (storage_default_folder) REFERENCES public.directus_folders(id) ON DELETE SET NULL;


--
-- Name: directus_shares directus_shares_collection_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_collection_foreign FOREIGN KEY (collection) REFERENCES public.directus_collections(collection) ON DELETE CASCADE;


--
-- Name: directus_shares directus_shares_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_shares directus_shares_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_users directus_users_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE SET NULL;


--
-- Name: directus_versions directus_versions_collection_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_collection_foreign FOREIGN KEY (collection) REFERENCES public.directus_collections(collection) ON DELETE CASCADE;


--
-- Name: directus_versions directus_versions_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_versions directus_versions_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: hotspots360 hotspots360_station_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.hotspots360
    ADD CONSTRAINT hotspots360_station_foreign FOREIGN KEY (station) REFERENCES public.stations(id);


--
-- Name: medien medien_station_foreign; Type: FK CONSTRAINT; Schema: public; Owner: directus
--

ALTER TABLE ONLY public.medien
    ADD CONSTRAINT medien_station_foreign FOREIGN KEY (station) REFERENCES public.stations(id);


--
-- PostgreSQL database dump complete
--

\unrestrict K0F2lIGYZicdHTZSSykcVKppdqyXhwUvsAFFtCOka20Qa2Nd1dUE2RhMi19gEv2

