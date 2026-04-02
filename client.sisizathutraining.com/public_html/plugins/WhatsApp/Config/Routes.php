<?php

namespace Config;

$routes = Services::routes();

$routes->get('whatsapp_settings', 'WhatsApp_settings::index', ['namespace' => 'WhatsApp\Controllers']);
$routes->get('whatsapp_settings/(:any)', 'WhatsApp_settings::$1', ['namespace' => 'WhatsApp\Controllers']);
$routes->post('whatsapp_settings/(:any)', 'WhatsApp_settings::$1', ['namespace' => 'WhatsApp\Controllers']);

$routes->get('whatsapp_updates', 'WhatsApp_Updates::index', ['namespace' => 'WhatsApp\Controllers']);
$routes->get('whatsapp_updates/(:any)', 'WhatsApp_Updates::$1', ['namespace' => 'WhatsApp\Controllers']);
