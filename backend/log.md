# Root logger option

log4j.rootLogger=DEBUG, stdout, file, error

# stdout, file, error --> khai báo khi muốn ghi log cho từng trường hợp, có thể đặt tên tùy ý

# VD: các trường hợp đặt tên:

#       - ghi log console - stdout

#       - ghi log file với level INFO - file

#       - ghi log file với level ERROR - error

#       - Các level còn lại thì tương tự



#***Chú ý:

# Các trương hợp ghi file thì chú ý vào Threshold khai báo level là gì;

# LEVEL của log4j: ALL < DEBUG < INFO < WARN < ERROR < FATAL < OFF --> Các level được sắp xếp theo thứ tự phân cấp giảm dần.

#       VD1: Khi cấu hình khi file với  Threshold là level ALL --> Thì file này sẽ chứa tất cả các log ghi của các level còn lại DEBUG < INFO < WARN < ERROR < FATAL < OFF

#       VD2: Khi cấu hình khi file với  Threshold là level DEBUG --> Thì file này sẽ chứa tất cả các log ghi của các level còn lại  INFO < WARN < ERROR < FATAL < OFF (trừ level ALL)

# ==> Xem chi tiết mức phân cấp từng level  :https://javapapers.com/log4j/log4j-levels/





# Cấu hình ghi log ở console - Config log messages to console

log4j.appender.stdout=org.apache.log4j.ConsoleAppender

# System.out or System.err --> dùng 1 trong 2 giống xem log của console

log4j.appender.stdout.Target=System.out

log4j.appender.stdout.layout=org.apache.log4j.PatternLayout

#Định dạng log khi ghi vào file (xem chi tiết dòng 62)

log4j.appender.stdout.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5l %-5p - %m%n



# Redirect log messages to a log file, support file daily rolling or rolling.



#Cấu hình ghi file khi gọi level INFO

log4j.appender.file=org.apache.log4j.DailyRollingFileAppender

#log4j.appender.file=org.apache.log4j.RollingFileAppender

log4j.appender.file.File=..\\logs\\log4j-application.log

log4j.appender.file.DatePattern = '.'yyyy-MM-dd

# Dùng 2 cái này khi dùng log4j.appender.file=org.apache.log4j.RollingFileAppender

#log4j.appender.file.MaxFileSize=10MB

#log4j.appender.file.MaxBackupIndex=10

log4j.appender.file.layout=org.apache.log4j.PatternLayout

# Xem ở dưới

log4j.appender.file.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n

# Cấu hình level ghi log

log4j.appender.file.Threshold = INFO



# Redirect log messages to a log error file, support file rolling.



#Cấu hình ghi file khi gọi level ERROR

# Tìm hiểu sự khác nhau giữa DailyRollingFileAppender và RollingFileAppender

# DailyRollingFileAppender --> ghi file theo ngày

# RollingFileAppender --> ghi file theo size và có hạn chế về số file

log4j.appender.error=org.apache.log4j.DailyRollingFileAppender

#log4j.appender.error=org.apache.log4j.RollingFileAppender

#<!--

# Dùng 2 cái này khi dùng log4j.appender.file=org.apache.log4j.RollingFileAppender

#log4j.appender.file.MaxFileSize=10MB

#log4j.appender.file.MaxBackupIndex=10

# -->

# Cấu hình đường dẫn file ghi logs

log4j.appender.error.File=..\\logs\\log-error.log

# '.'yyyy-MM-dd --> ghi file mới vào 0 giờ ngày tiếp theo (Chỉ dùng khi dùng DailyRollingFileAppender)

#Xem các giá trị theo link này --> https://logging.apache.org/log4j/1.2/apidocs/org/apache/log4j/DailyRollingFileAppender.html

log4j.appender.error.DatePattern = '.'yyyy-MM-dd

#định dạng xuất log

log4j.appender.error.layout=org.apache.log4j.PatternLayout

#Định dạng log khi ghi vào file

# VD:2020-02-04 15:07:31 INFO  testLogClass:10 - aaaa

# %d{yyyy-MM-dd HH:mm:ss} --> 2020-02-04 15:07:31

# %-5p --> định dạng LEVEL khi gọi()

# %c{1} --> Tên class thực hiện gọi log

# %L --> xác định dòng ghi log

# %m%n --> thông tin chính khi xuất log

# note:

#       - Nếu chỉ hiện tên class và dòng đặt log thì dùng %c{1}:%L

#       - Nếu muốn hiện cả đường dẫn chi tiết class thì dùng %-5l thay vị trí %c{1}:%L

#log4j.appender.error.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %-5l - %m%n

log4j.appender.error.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n

#Cấu hình ghi log cho level nào

log4j.appender.error.Threshold = ERROR 