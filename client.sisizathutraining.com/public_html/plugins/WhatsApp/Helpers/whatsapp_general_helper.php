<?php

/**
 * link the css files 
 * 
 * @param array $array
 * @return print css links
 */
if (!function_exists('whatsapp_load_css')) {

    function whatsapp_load_css(array $array) {
        $version = get_setting("app_version");

        foreach ($array as $uri) {
            echo "<link rel='stylesheet' type='text/css' href='" . base_url($uri) . "?v=$version' />";
        }
    }

}

/**
 * get the defined config value by a key
 * @param string $key
 * @return config value
 */
if (!function_exists('get_whatsapp_setting')) {

    function get_whatsapp_setting($key = "") {
        $config = new WhatsApp\Config\WhatsApp();

        $setting_value = get_array_value($config->app_settings_array, $key);
        if ($setting_value !== NULL) {
            return $setting_value;
        } else {
            return "";
        }
    }

}