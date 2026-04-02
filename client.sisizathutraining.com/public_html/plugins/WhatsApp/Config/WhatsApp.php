<?php

/* Don't change or add any new config in this file */

namespace WhatsApp\Config;

use CodeIgniter\Config\BaseConfig;
use WhatsApp\Models\WhatsApp_settings_model;

class WhatsApp extends BaseConfig {

    public $app_settings_array = array();

    public function __construct() {
        $whatsapp_settings_model = new WhatsApp_settings_model();

        $settings = $whatsapp_settings_model->get_all_settings()->getResult();
        foreach ($settings as $setting) {
            $this->app_settings_array[$setting->setting_name] = $setting->setting_value;
        }
    }

}
