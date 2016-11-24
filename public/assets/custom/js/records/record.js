/**
 * Created by Cecilee2 on 8/4/2015.
 */

$(function () {
    $(document.body).on('click', '.delete_record',function(e){
        e.preventDefault();

        var parent = $(this).parent().parent();
        var record = parent.children(':nth-child(2)').html();
        var record_id = $(this).val();

        bootbox.dialog({
            message: 'Are You sure You want to permanently delete Record: <span class="bold"> '+record+'</span> and all its reference places',
            title: '<span class="bold font-red">Warning Alert</span>',
            buttons: {
                danger: {
                    label: "NO",
                    className: "btn-default",
                    callback: function() {
                        $(this).hide();
                    }
                },
                success: {
                    label: "YES",
                    className: "btn-success",
                    callback: function() {
                        $.ajax({
                            type: 'GET',
                            async: true,
                            url: '/records/delete/' + record_id,
                            success: function(data,textStatus){
                                window.location.replace('/records');
                            },
                            error: function(xhr,textStatus,error){
                                bootbox.alert("Error encountered pls try again later..", function() {
                                    $(this).hide();
                                });
                            }
                        });
                    }
                }
            }
        });
    });
});