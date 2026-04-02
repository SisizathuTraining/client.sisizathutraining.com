<?php

namespace WhatsApp\Controllers;

use App\Controllers\Security_Controller;

class WhatsApp_settings extends Security_Controller {

    protected $WhatsApp_settings_model;

    function __construct() {
        parent::__construct();
        $this->access_only_admin_or_settings_admin();
        $this->WhatsApp_settings_model = new \WhatsApp\Models\WhatsApp_settings_model();
    }

    function index() {
        return $this->template->rander("WhatsApp\Views\settings\index");
    }

    function save_whatsapp_settings() {
        $settings = array("mobile_phone_number_both", "mobile_phone_number_team", "mobile_phone_number_client");

        foreach ($settings as $setting) {
            $value = $this->request->getPost($setting);
            if (is_null($value)) {
                $value = "";
            }

            $this->WhatsApp_settings_model->save_setting($setting, $value);
        }

        echo json_encode(array("success" => true, 'message' => app_lang('settings_updated')));
    }

}
