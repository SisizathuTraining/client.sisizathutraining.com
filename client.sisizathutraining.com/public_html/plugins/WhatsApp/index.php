<?php

defined('PLUGINPATH') or exit('No direct script access allowed');

/*
  Plugin Name: WhatsApp Integration
  Description: Support your clients and team members through WhatsApp chat.
  Version: 1.0
  Requires at least: 2.9.2
  Author: OrbitCRM
  Author URL: https://atomweb.co.za
 */

//add admin setting menu item
app_hooks()->add_filter('app_filter_admin_settings_menu', function ($settings_menu) {
    $settings_menu["setup"][] = array("name" => "whatsapp_integration", "url" => "whatsapp_settings");
    return $settings_menu;
});

//install dependencies
register_installation_hook("WhatsApp", function ($item_purchase_code) {
    include PLUGINPATH . "WhatsApp/install/do_install.php";
});

//add setting link to the plugin setting
app_hooks()->add_filter('app_filter_action_links_of_WhatsApp', function ($action_links_array) {
    $action_links_array = array(
        anchor(get_uri("whatsapp_settings"), app_lang("settings"))
    );

    return $action_links_array;
});

//update plugin
use WhatsApp\Controllers\WhatsApp_Updates;

register_update_hook("WhatsApp", function () {
    $update = new WhatsApp_Updates();
    return $update->index();
});

//uninstallation: remove data from database
register_uninstallation_hook("WhatsApp", function () {
    $dbprefix = get_db_prefix();
    $db = db_connect('default');

    $sql_query = "DROP TABLE IF EXISTS `" . $dbprefix . "whatsapp_settings`;";
    $db->query($sql_query);
});

use App\Controllers\Security_Controller;

//add whatsapp link button in page view
app_hooks()->add_action('app_hook_layout_main_view_extension', function () {
    $instance = new Security_Controller();
    $view_data["user_type"] = $instance->login_user->user_type;
    echo view("WhatsApp\Views\whatsapp\chat_button", $view_data);
});
