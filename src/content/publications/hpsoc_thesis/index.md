---
slug: hpsoc_thesis
title: High-Performance Service-Oriented Computing
authors:
  - admin
  - bill-dally
date: "2016-06-01T00:00:00Z"
type: "7"
venue: "*Stanford University*"
venueShort: ""
abstract: This dissertation presents Sikker, a highly-scalable high-performance distributed system architecture for secure service-oriented computing. Sikker includes a novel service-oriented application model upon which security and isolation policies are derived and enforced. The workhorse of Sikker is a custom network interface controller, called the Network Management Unit (NMU), that enforces Sikker’s security and isolation policies while providing high-performance network access. Sikker’s application model satisfies the complex interactions of modern large-scale distributed applications. Experimental results show that even when implemented on very large clusters, the NMU adds a negligible message latency of 41 ns under realistic workloads and 91 ns at the 99:99th percentile of worst-case access patterns. Analysis shows that the NMU can support many hundreds of Gbps of bandwidth with common VLSI technologies while imposing zero overhead on the CPU. Integrated into Sikker and the NMU is a novel service-oriented, distributed rate-control algorithm, called Sender-Enforced Token and Rate Exchange (SE-TRE), that is able to regulate service-to-service aggregate rates while imposing zero latency overhead at the 99:99th percentile, less than 0.3% bandwidth overhead, and zero overhead on the CPU. Sikker’s service-oriented security and isolation methodology removes high overheads imposed by current systems. Sikker allows distributed applications to operate in an environment with fine-grained security and isolation while experiencing supercomputer-like network performance.
summary: This dissertation presents Sikker, a highly-scalable high-performance distributed system architecture for secure service-oriented computing.
tags:
  - Distributed Computing
  - Networks
  - Security
doi: ""
image: ./featured.png
imageAlt: High-Performance Service-Oriented Computing featured graphic
projects: []
pdf: pubs/nicmcdonald_hpsoc_stanford_2016.pdf
slides: pubs/nicmcdonald_hpsoc_stanford_2016_slides.pdf
bibPath: publication/hpsoc_thesis/cite.bib
---
