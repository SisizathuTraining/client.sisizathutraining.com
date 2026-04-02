<?php
//get receiver number for this user
if ($user_type === "staff") {
    $phone_number_for_this_user = get_whatsapp_setting("mobile_phone_number_team");
} else {
    $phone_number_for_this_user = get_whatsapp_setting("mobile_phone_number_client");
}

if (!$phone_number_for_this_user) {
    $phone_number_for_this_user = get_whatsapp_setting("mobile_phone_number_both");
}
?>

<?php if ($phone_number_for_this_user) { ?>

    <?php whatsapp_load_css(array(PLUGIN_URL_PATH . "WhatsApp/assets/css/whatsapp_styles.css")); ?>

    <a href="https://wa.me/<?php echo $phone_number_for_this_user; ?>" target="_blank">
        <div id="js-whatsapp-contact-icon" class="init-chat-icon whatsapp-contact-icon">
            <span class="chat-min-icon"><?php echo view("WhatsApp\Views\svg_icons\whatsapp"); ?></span>
        </div>
    </a>

    <script type="text/javascript">
        "use strict";

        $(document).ready(function () {
            //if the chat icon is visible, show the whatsapp icon beside the chat icon
            if ($("#js-init-chat-icon").length) {
                $("#js-whatsapp-contact-icon").css({right: "90px"});
            }
        });
    </script>

<?php } ?>