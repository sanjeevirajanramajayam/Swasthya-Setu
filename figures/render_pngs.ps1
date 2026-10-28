$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$dir = 'C:\Users\arund\Downloads\MiniProjectS5\figures'

# Copy Figures 4.1, 4.2, 4.3 with standard names
Copy-Item "$dir\clinical_intake_interface_1793083934297.jpg" "$dir\Figure_4.1_Migrant_Worker_Clinical_Intake_Interface.jpg" -Force
Copy-Item "$dir\triage_hospital_recommendations_1793083973983.jpg" "$dir\Figure_4.2_Clinical_Triage_Predictions_and_Hospital_Recommendations.jpg" -Force
Copy-Item "$dir\hospital_network_portal_1793084004764.jpg" "$dir\Figure_4.3_Healthcare_Portal_and_Regional_Hospital_Network.jpg" -Force

# Convert SVG 4.4, 4.5, 4.6 to PNG
$svg44 = "file:///C:/Users/arund/Downloads/MiniProjectS5/figures/longitudinal_care_pathway_graph.svg"
$png44 = "$dir\Figure_4.4_Interactive_Longitudinal_Care_Pathway_Graph.png"
Start-Process -FilePath $edge -ArgumentList '--headless', "--screenshot=$png44", '--window-size=1920,1080', '--hide-scrollbars', $svg44 -Wait

$svg45 = "file:///C:/Users/arund/Downloads/MiniProjectS5/figures/healthcare_governance_dashboard.svg"
$png45 = "$dir\Figure_4.5_Healthcare_Governance_Dashboard.png"
Start-Process -FilePath $edge -ArgumentList '--headless', "--screenshot=$png45", '--window-size=1920,1080', '--hide-scrollbars', $svg45 -Wait

$svg46 = "file:///C:/Users/arund/Downloads/MiniProjectS5/figures/clinical_assessment_hospital_visits.svg"
$png46 = "$dir\Figure_4.6_Clinical_Health_Assessment_and_Hospital_Visits.png"
Start-Process -FilePath $edge -ArgumentList '--headless', "--screenshot=$png46", '--window-size=1920,1080', '--hide-scrollbars', $svg46 -Wait

# Also copy all 6 images to the artifact directory so they match the markdown paths exactly
$artDir = 'C:\Users\arund\.gemini\antigravity-ide\brain\3c01e4b8-b613-4e26-8a08-611325ff4859'
Copy-Item "$dir\Figure_4.*" $artDir -Force

Get-ChildItem -Path $dir -Filter "Figure_4.*" | Select-Object Name, Length
