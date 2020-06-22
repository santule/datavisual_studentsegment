#libraries
library(dplyr)
library(tidyr)
library(modeest)
library(stringr)
library(Rtsne)
library(cluster)
library(ggplot2)

###################################### CLUSTERING TO FIND STUDENT SEGMENTS OR CLUSTERS - BASED ON DEMOGRAPHICS / ACADEMIC PERFORMANCE/ VLE ENGAGEMENT ###############################################################

# STEP 1 - Read all input files

# Read student info file
studentinfo  <- read.csv('data/studentinfo.csv')
# Read student vle file ( enagement)
studentvle  <- read.csv('data/studentVle.csv')
# Read assessment file
studentassessment  <- read.csv('data/studentAssessment.csv')
# Read vle file
vle <- read.csv('data/vle.csv')
# Read assessment file
assessment <- read.csv('data/assessments.csv')


# STEP 2 - REMOVE DUPLICATE,TAKE FIRST CODE_MODULE ENROLMENT FOR EVERY STUDENT ALONG WITH DEMO INFO

student_info_summary_stg <- studentinfo %>%
  select(id_student,code_module,code_presentation,final_result,gender,highest_education,age_band,region) %>%
  arrange(code_presentation,age_band) %>%
  group_by(id_student) %>%
  filter(row_number() == 1)


# STEP 3 - SUMMARISE STUDENT ASSESSMENT AND GET THE AVERAGE SCORE FOR THAT CODE MODULE
student_assessment_summary_stg <- inner_join(studentassessment,assessment,by=c("id_assessment"))

# take the average score for a code module, for a code presentation for every student

student_assessment_summary <- student_assessment_summary_stg %>%
  group_by(id_student,code_module,code_presentation) %>%
  summarise(
    score_avg = sum(as.numeric(score)) / sum(n())
  )

# STEP 4 - JOIN STUDENT DATA WITH THE AVERAGE SCORE
student_info_summary_stg_assess <- left_join(student_info_summary_stg,student_assessment_summary,by=c("id_student","code_module","code_presentation"))


# STEP 5 - SUMMARISE STUDENT VLE ACTIVTIY

#5.1 Get weekly sum of clicks by students per module per content type
student_vle_summary_stg <- studentvle %>%
  filter(as.numeric(date)>=0) %>%
 #filter(id_student == 28400) %>%
  mutate(week_number = 
           case_when(
             ceiling(as.numeric(date)/7) <= 4 ~ 'intial weeks',
             ceiling(as.numeric(date)/7) > 4 & ceiling(as.numeric(date)/7) <=30  ~ 'mid weeks',
             TRUE  ~ 'late weeks'
         )
         )%>%
  group_by(id_student,week_number,code_module) %>%
  summarise(sum_clicks_weekly = sum(as.numeric(sum_click)))


#5.2 join to activity type to get the sum of clicks by content name
student_vle_summary_grp_activity <- student_vle_summary_stg %>%
                            group_by(id_student,week_number,code_module) %>%
                              summarise(total_sum_clicks_weekly = sum(as.numeric(sum_clicks_weekly)))



#5.3 filter out the student vle activity not needed
student_vle_summary_grp_activity_filter <- inner_join(student_info_summary_stg,student_vle_summary_grp_activity,by=c("id_student","code_module"))

#5.4 pivot the data to get each week and activity as column and sum of clicks as value
student_vle_summary_grp_activity_transform <- student_vle_summary_grp_activity_filter %>%
  select(id_student,week_number,total_sum_clicks_weekly) %>%
  mutate(
    week_category_active = paste(week_number,'-active'),
    week_active = 1
  )


# 5.5 pivot the data for preparing it for machine learning.
student_weekly_summary_clicks <- spread(student_vle_summary_grp_activity_transform[,c("id_student","week_number","total_sum_clicks_weekly")],week_number,total_sum_clicks_weekly)


#5.6 pivot the data to get active flag for each week for each student
student_weekly_active <- student_vle_summary_grp_activity_transform %>%
  select(id_student,week_category_active,week_active) %>%
  distinct()

student_weekly_active_flag <- spread(student_weekly_active[,c("id_student","week_category_active","week_active")],week_category_active,week_active)

#5.7 combine sudent active flag and sum of clicks
student_vle_weekly_summary <- inner_join(student_weekly_summary_clicks,student_weekly_active_flag,by="id_student")


# STEP 6 - Combine student demographics and vle activity data
student_all_info <- inner_join(student_info_summary_stg_assess,student_vle_weekly_summary,by="id_student")


# STEP 7 - Run gower distance clustering

#We need to prepare the data - to remove NAs and remove student id
student_all_info_kmeans <- student_all_info

# Replace NA with 0
student_all_info_kmeans [is.na(student_all_info_kmeans)] <- 0
student_all_info_kmeans <- rename(student_all_info_kmeans, initial_active = 'intial weeks -active')
student_all_info_kmeans <- rename(student_all_info_kmeans, mid_active = 'mid weeks -active')
student_all_info_kmeans <- rename(student_all_info_kmeans, late_active = 'late weeks -active')


#drop column student id,code_presentation and weeks active flag
student_all_info_kmeans <- subset(student_all_info_kmeans, select = -c(id_student,code_presentation,initial_active,mid_active,late_active))

#Convert categorical columns into factors
student_all_info_kmeans$code_module <- as.factor(student_all_info_kmeans$code_module)
student_all_info_kmeans$final_result <- as.factor(student_all_info_kmeans$final_result)
student_all_info_kmeans$gender <- as.factor(student_all_info_kmeans$gender)
student_all_info_kmeans$highest_education <- as.factor(student_all_info_kmeans$highest_education)
student_all_info_kmeans$region <- as.factor(student_all_info_kmeans$region)
student_all_info_kmeans$age_band <- as.factor(student_all_info_kmeans$age_band)


#Apply scaling to numeric columns
student_all_info_kmeans <- student_all_info_kmeans %>% mutate_if(is.numeric, ~(scale(.) %>% as.vector))

set.seed(10)
#Apply clustering - gower distance
# This requires atleast enough memory to run
###  ---> to run this first use --> memory.limit(24000)
gower_dist <- daisy(student_all_info_kmeans, metric = "gower")


# fit the clusters - best clusters is 3.
k <- 3
pam_fit <- pam(gower_dist, diss = TRUE, k)
pam_results <- student_all_info_kmeans %>%
  mutate(cluster = pam_fit$clustering) %>%
  group_by(cluster) %>%
  do(the_summary = summary(.))
pam_results$the_summary

#write the clusters in student_info object
student_all_info$cluster <- pam_fit$clustering


#STEP 8 - find the lower dimensions so we can visualise the clusters in D3.

#drop column student id,code_presentation and weeks active flag
student_pca_stg <- student_all_info
student_pca_stg [is.na(student_pca_stg)] <- 0
student_pca_stg <- rename(student_pca_stg, initial_active = 'intial weeks -active')
student_pca_stg <- rename(student_pca_stg, mid_active = 'mid weeks -active')
student_pca_stg <- rename(student_pca_stg, late_active = 'late weeks -active')
student_pca_stg <- subset(student_pca_stg, select = -c(id_student,code_presentation,initial_active,mid_active,late_active,region))


#convert categorical into numerical to do pca

student_pca <- student_pca_stg %>%
  mutate(
    gender_numerical = case_when(
      gender == "F" ~1,
      TRUE ~2
    ),
    code_module_numerical =case_when(
      code_module == "AAA" ~1,
      code_module == "BBB" ~2,
      code_module == "CCC" ~3,
      code_module == "DDD" ~4,
      code_module == "EEE" ~5,
      code_module == "FFF" ~6,
      TRUE ~ 7
    ),
    age_band_numerical =case_when(
      age_band == "0-35" ~1,
      age_band == "35-55" ~2,
      TRUE ~ 3
    ),
    final_result_numerical = case_when(
      final_result  == "Pass" ~1,
      final_result  == "Distinction" ~2,
      final_result  == "Fail" ~3,
      TRUE ~4
    ),
    highest_education_numerical = case_when(
      highest_education == "Lower Than A Level" ~ 1,
      highest_education == "A Level or Equivalent" ~ 2,
      highest_education == "HE Qualification" ~ 3,
      highest_education == "Post Graduate Qualification" ~ 4,
      TRUE ~5
    )
  )

student_pca <- subset(student_pca, select = -c(gender,highest_education,final_result,age_band,code_module))
student_pca.pca <- prcomp(student_pca, center = TRUE,scale. = TRUE)


# STEP 9 - put the pca dimension values against each student id
student_all_info$x <- student_pca.pca$x[,"PC1"]
student_all_info$y <- student_pca.pca$x[,'PC2']

#plot in R to see if clusters make sense.
ggplot(student_all_info,aes(x=x,y=y,color = as.factor(cluster))) + geom_point()

# STEP 10 - write the infor to the file , so we can use it further for visualisation processing in the next R script
student_all_info[is.na(student_all_info)] <- 0
write.csv(student_all_info,"processeddata/student_all_info_clusters.csv",row.names=FALSE)



