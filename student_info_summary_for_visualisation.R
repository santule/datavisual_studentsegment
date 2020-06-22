#libraries
library(dplyr)
library(tidyr)
#library(modeest)
library(stringr)
library(ids)

###################################### CREATE THE FILE FOR VISUALISATION ########################################
### INPUT FOR THIS STEP IS THE CLUSTERS CREATED FROM PREVIOUS R SCRIPT ###


#STEP 1 - Read the student clusters from the file created by student_cluster_segment.R script
student_cluster_summary <- read.csv('processeddata/student_all_info_clusters.csv')
student_cluster_summary <- rename(student_cluster_summary, study_pattern = code_module)
student_cluster_summary <- rename(student_cluster_summary, study_outcome = final_result)


#STEP 2 - Group the students in small buckets, so they can easily visualise bubbles in D3.
stu_visualise_stg_1 <- student_cluster_summary%>%
  group_by(study_outcome,gender,highest_education,age_band,cluster,intial.weeks..active,mid.weeks..active,late.weeks..active)%>%
  summarise(sum_initial_weeks_clicks = sum(intial.weeks) ,
            sum_late_weeks_clicks =   sum(late.weeks),
            sum_mid_weeks_clicks = sum(mid.weeks),
            sum_all_weeks_clicks = sum(intial.weeks,late.weeks,mid.weeks),
            weeks_active = sum(intial.weeks..active,mid.weeks..active,late.weeks..active),
            sum_x = sum(x),
            sum_y = sum(y),
            total_students = sum(n()),
            sum_score = sum(score_avg))


#STEP 3 - calculate the clicks /student and other aggregated measures for visualisation

stu_visualise_stg_2 <- stu_visualise_stg_1 %>%
  select(study_outcome,gender,highest_education,age_band,cluster,intial.weeks..active,mid.weeks..active,late.weeks..active,sum_initial_weeks_clicks,total_students,
         sum_mid_weeks_clicks,sum_late_weeks_clicks,sum_x,sum_y,sum_all_weeks_clicks,weeks_active,sum_score) %>%
  mutate(
    initial_weeks_clicks_per_student = round(sum_initial_weeks_clicks/total_students),
    mid_weeks_clicks_per_student = round(sum_mid_weeks_clicks/total_students),
    late_weeks_clicks_per_student = round(sum_late_weeks_clicks/total_students),
    avg_clicks_per_student = round(sum_all_weeks_clicks/total_students),
    percent_weeks_active = (round(weeks_active/total_students)/3) * 100,
    x = sum_x/total_students,
    y = sum_y/total_students,
    grade = case_when(
      study_outcome == "Pass" ~ "Pass",
      study_outcome == "Distinction" ~ "Pass",
      TRUE ~ "Fail"
    ),
    gender_age_band = paste(gender,'-',age_band),
    xposition = x + 20,
    yposition = y +5,
    avg_score = round(sum_score/total_students),
    score_bucket = case_when(
    avg_score > 60  ~ "g60",
      TRUE ~ "l60"
    ),
    gender_grade = paste(gender,'-',score_bucket)
  )




#STEP 4 - Give a dummy group identifier for each group
stu_visualise_stg_2['group_id'] <- ids::random_id(532,3)


#STEP 5 - Write to output file, so D3 can read it from this file.
write.csv(stu_visualise_stg_2,'processeddata/stu_visualise_data.csv',row.names=FALSE)




