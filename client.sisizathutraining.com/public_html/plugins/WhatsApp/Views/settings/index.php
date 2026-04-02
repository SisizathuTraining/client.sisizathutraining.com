<div id="page-content" class="page-wrapper clearfix">
    <div class="row">
        <div class="col-sm-3 col-lg-2">
            <?php
            $tab_view['active_tab'] = "whatsapp_integration";
            echo view("settings/tabs", $tab_view);
            ?>
        </div>

        <div class="col-sm-9 col-lg-10">
            <div class="card">

                <div class="card-header">
                    <h4><?php echo app_lang("whatsapp_integration"); ?></h4>
                </div>

                <?php echo form_open(get_uri("whatsapp_settings/save_whatsapp_settings"), array("id" => "whatsapp-settings-form", "class" => "general-form dashed-row", "role" => "form")); ?>

                <div class="card-body general-form dashed-row">
                    <div class="form-group">
                        <div class="row">
                            <div class="col-md-12">
                                <i data-feather='info' class="icon-16"></i> <?php echo app_lang("whatsapp_integration_help_message"); ?>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <label for="mobile_phone_number_both" class=" col-md-3"><?php echo app_lang('whatsapp_mobile_phone_number_both'); ?></label>
                            <div class=" col-md-9">
                                <?php
                                echo form_input(array(
                                    "id" => "mobile_phone_number_both",
                                    "name" => "mobile_phone_number_both",
                                    "value" => get_whatsapp_setting("mobile_phone_number_both"),
                                    "class" => "form-control",
                                    "placeholder" => app_lang('whatsapp_mobile_phone_number')
                                ));
                                ?>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <label for="mobile_phone_number_team" class=" col-md-3"><?php echo app_lang('whatsapp_mobile_phone_number_team'); ?></label>
                            <div class=" col-md-9">
                                <?php
                                echo form_input(array(
                                    "id" => "mobile_phone_number_team",
                                    "name" => "mobile_phone_number_team",
                                    "value" => get_whatsapp_setting("mobile_phone_number_team"),
                                    "class" => "form-control",
                                    "placeholder" => app_lang('whatsapp_mobile_phone_number')
                                ));
                                ?>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <label for="mobile_phone_number_client" class=" col-md-3"><?php echo app_lang('whatsapp_mobile_phone_number_client'); ?></label>
                            <div class=" col-md-9">
                                <?php
                                echo form_input(array(
                                    "id" => "mobile_phone_number_client",
                                    "name" => "mobile_phone_number_client",
                                    "value" => get_whatsapp_setting("mobile_phone_number_client"),
                                    "class" => "form-control",
                                    "placeholder" => app_lang('whatsapp_mobile_phone_number')
                                ));
                                ?>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button type="submit" class="btn btn-primary"><span data-feather='check-circle' class="icon-16"></span> <?php echo app_lang('save'); ?></button>
                </div>

                <?php echo form_close(); ?>

            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    "use strict";

    $(document).ready(function () {
        $("#whatsapp-settings-form").appForm({
            isModal: false,
            onSuccess: function (result) {
                appAlert.success(result.message, {duration: 10000});
                location.reload();
            }
        });
    });
</script>